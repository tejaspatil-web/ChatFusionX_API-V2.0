export class Message{
    userId:string
    userName:string
    message:string
    time:string
}

export class SavePrivateMessageDto{
    chatId:string
    message:Message
}