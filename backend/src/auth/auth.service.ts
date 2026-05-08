import { USER_ROLE } from '@/databases/samples';
import { CreateUserDto, RegisterUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users.service';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms, { StringValue } from 'ms';
import { OAuthResponseData, SocialLoginInput } from './dto/social-login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) { }

    handleRegister(user: RegisterUserDto) {
        let newUser = { ...user, role: USER_ROLE } as CreateUserDto;
        return this.usersService.create(newUser)
    }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.usersService.findOneByEmail(username)
        if (user && this.usersService.validatePassword(password, user.password)) {
            return user
        }
        return null
    }

    async login(user: any) {
        const payload = {
            sub: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        const refreshToken = this.createRefreshToken(payload);

        // Update user with refresh token
        await this.usersService.updateUserToken(refreshToken, user._id.toString());

        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken,
            expiresIn: ms(this.configService.get<string>('JWT_EXPIRES_IN') as StringValue || '1d') / 1000,
            user
        };
    }

    createRefreshToken = (payload: any) => {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') || this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') as StringValue || '7d' as StringValue,
        });
        return refreshToken;
    }

    async handleSocialLogin(input: SocialLoginInput): Promise<any> {
        // Tìm user trong hệ thống qua email
        let user = await this.usersService.findOneByEmail(input.email);

        // Nếu chưa tồn tại, tiến hành tạo mới
        if (!user) {
            user = await this.usersService.createSocialUser(input.email, input.name);
        }

        // Ký JWT Token
        const payload = {
            sub: user._id,
            email: user.email,
            name: user.name,
            role: user.role
        };

        const refreshToken = this.createRefreshToken(payload);

        // Update user with refresh token
        await this.usersService.updateUserToken(refreshToken, user._id.toString());

        return {
            accessToken: this.jwtService.sign(payload),
            refreshToken,
            expiresIn: ms(this.configService.get<string>('JWT_EXPIRES_IN') as StringValue || '1d') / 1000,
            user: user
        };
    }

    async processRefreshToken(refreshToken: string) {
        try {
            this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') || this.configService.get<string>('JWT_SECRET')
            });

            const user = await this.userByRefreshToken(refreshToken);
            if (user) {
                const payload = {
                    sub: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                };

                const newRefreshToken = this.createRefreshToken(payload);

                // Update user with new refresh token
                await this.usersService.updateUserToken(newRefreshToken, user._id.toString());

                return {
                    accessToken: this.jwtService.sign(payload),
                    refreshToken: newRefreshToken,
                    expiresIn: ms(this.configService.get<string>('JWT_EXPIRES_IN') as StringValue || '1d') / 1000,
                    user
                };
            } else {
                throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn (không tìm thấy người dùng)");
            }
        } catch (error) {
            console.error("Refresh Token Error:", error.message);
            throw new UnauthorizedException("Refresh token không hợp lệ hoặc đã hết hạn");
        }
    }

    async userByRefreshToken(refreshToken: string) {
        return await this.usersService.findOneByRefreshToken(refreshToken);
    }
}
