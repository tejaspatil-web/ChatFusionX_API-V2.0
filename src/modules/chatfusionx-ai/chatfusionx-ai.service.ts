import { HttpStatus, Injectable } from '@nestjs/common';
import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { InjectModel } from '@nestjs/mongoose';
import { ChatFusionXAI } from './chatfusionx-ai.schema';
import { Model } from 'mongoose';
import { UserContextService } from 'src/common/user-context/user-context.service';
import { ChatState } from './dtos/chatfusionx-ai.dto';

@Injectable()
export class ChatFusionXAIService {
  private readonly genAI: GoogleGenerativeAI;

  constructor(
    @InjectModel(ChatFusionXAI.name)
    private readonly chatFusionXAIModel: Model<ChatFusionXAI>,
    private readonly userContextService: UserContextService,
  ) {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  private createModel(documentContext: string): GenerativeModel {
    const userName = this.userContextService.getUserName() || 'User';
    const systemInstruction = this.buildSystemInstruction(
      userName,
      documentContext,
    );
    return this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction,
    });
  }

  private buildSystemInstruction(
    userName: string,
    documentContext?: string,
  ): string {
    let instruction = `
You are ChatFusionX AI, the official AI assistant of the ChatFusionX application.

The current user's name is "${userName}".

Rules:
- If the user asks about your name, identity, or who you are, respond exactly with:
  "I am ChatFusionX AI."
- If the user asks about their own name, respond exactly with:
  "Your name is ${userName}."
- Do not add extra text in these cases.
`;

    if (documentContext?.trim()) {
      instruction += `\n\n${documentContext}`;
    }

    return instruction;
  }

  async getChat(userId): Promise<any> {
    try {
      const messages = await this.chatFusionXAIModel
        .findOne({ _id: userId })
        .select('messages.parts messages.role -_id')
        .lean();

      return messages?.messages?.length
        ? messages.messages.reduce((acc, { role, parts }) => {
            if (role !== 'system') {
              acc.push({
                role,
                message: parts[0]?.text,
              });
            }
            return acc;
          }, [])
        : [];
    } catch (error) {
      console.error('ChatFusionXAI Error:', error);
      throw {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to get chat',
      };
    }
  }

  async getAiResponse(
    userId: string,
    prompt: string,
    extractedText: string,
    state: string,
  ): Promise<any> {
    try {
      if (state === ChatState.DOCUMENT_UPLOADED) {
        await this.saveDocumentContext(userId, extractedText);
      }

      const messages = await this.chatFusionXAIModel
        .findOne({ _id: userId })
        .select('messages.parts messages.role -_id')
        .lean();

      const allMessages = messages?.messages || [];

      const documentContext = allMessages
        .filter((m) => m.role === 'system')
        .map((m) => m.parts?.[0]?.text);

      const history = allMessages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'model',
          parts: m.parts,
        }));

      const model = this.createModel(documentContext?.[0] || '');

      const chat = model.startChat({ history });

      const result = await chat.sendMessage(prompt);
      const response = await result.response.text();
      await this.saveChatHistory(userId, response, prompt);
      return response;
    } catch (error) {
      const response = `<b class="error">Failed to generate AI response</b>`;
      console.error('ChatFusionXAI Error:', error);
      await this.saveChatHistory(userId, response, prompt);
      return response;
    }
  }

  async saveChatHistory(userId, response, prompt) {
    return await this.chatFusionXAIModel.findByIdAndUpdate(
      { _id: userId },
      {
        $push: {
          messages: {
            $each: [
              {
                parts: [{ text: prompt }],
                role: 'user',
              },
              {
                parts: [{ text: response }],
                role: 'model',
              },
            ],
          },
        },
      },
      { new: true, upsert: true },
    );
  }

  async saveDocumentContext(userId: string, extractedText: string) {
    const systemPrompt =
      this.buildSystemInstructionForExtractedText(extractedText);

    await this.chatFusionXAIModel.updateOne(
      { _id: userId },
      {
        // Remove old document if exists
        $pull: { messages: { role: 'system' } },
      },
    );

    await this.chatFusionXAIModel.updateOne(
      { _id: userId },
      {
        $push: {
          messages: {
            role: 'system',
            parts: [{ text: systemPrompt }],
          },
        },
      },
      { upsert: true },
    );
  }

  private buildSystemInstructionForExtractedText(extractedText) {
    return `
DOCUMENT_CONTEXT (ACTIVE DOCUMENT):

This is the user's most recently uploaded document.

Rules:
- Use this document ONLY if the user's question is related to it.
- If the user asks about "previous document", "uploaded document", or "last document",
  refer to THIS document.
- If the question is unrelated, ignore this document and answer normally.

Document Content:
${extractedText}
`;
  }
}
