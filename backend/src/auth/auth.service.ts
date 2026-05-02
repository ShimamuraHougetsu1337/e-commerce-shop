import { USER_ROLE } from '@/databases/samples';
import { CreateUserDto, RegisterUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SocialLoginInput, OAuthResponseData } from './dto/social-login.dto';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService,
        private readonly jwtService: JwtService
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
        return {
            accessToken: this.jwtService.sign(payload),
            user
        };
    }

    async handleSocialLogin(input: SocialLoginInput): Promise<OAuthResponseData> {
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

        return {
            accessToken: this.jwtService.sign(payload),
            user: user
        };
    }
}
