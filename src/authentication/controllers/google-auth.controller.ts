import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
    Res,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { CreateUserDto } from 'src/modules/user/dtos/user.dto';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { googleAuthDto } from '../dtos/google-auth.dto';
import { OAuth2Client } from 'google-auth-library';

@Throttle({ medium: { limit: 20, ttl: 10000 } })
@Controller({ path: 'google-auth', version: '1' })
export class GoogleAuthController {

    private _client = new OAuth2Client(
        "427483031981-2eunep9cd59bhhitbptqohclrfgb54c7.apps.googleusercontent.com"
    );

    constructor(
        private userService: UserService
    ) { }


    @Post('login')
    async loginWithGoogle(
        @Res() response: Response,
        @Body() googleAuthDto: googleAuthDto,
    ) {
        try {
            const accessToken = googleAuthDto.token;

            // Validate token
            const tokenInfo = await this._client.getTokenInfo(accessToken);

            //Fetch user profile
            const profileRes = await fetch(
                `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
            );

            const profile = await profileRes.json();

            const userDetails: CreateUserDto = {
                name: profile.name,
                email: profile.email,
                password: '',
                profileUrl: profile.picture
            };

            const data = await this.userService.googleWithGoogle(userDetails);

            if (data.isUserValid) {
                return response.status(HttpStatus.OK).send(data.userDetails);
            } else {
                throw new HttpException('Invalid password', HttpStatus.UNAUTHORIZED);
            }

        } catch (error) {
            console.error(error);
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }
}