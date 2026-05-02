import { Public, ResponseMessage } from '@/decorator/customize';
import { RegisterUserDto } from '@/users/dto/create-user.dto';
import { UsersService } from '@/users/users.service';
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SocialLoginInput } from './dto/social-login.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) { }

  @Public()
  @ResponseMessage("Register successfully")
  @Post("/register")
  register(@Body() user: RegisterUserDto) {
    return this.authService.handleRegister(user)
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage("Login successfully")
  @Post("login")
  login(@Req() req: any) {
    return this.authService.login(req.user)
  }

  @Get("profile")
  async handleTest(@Req() req: any) {
    const user = await this.usersService.findOne(req.user._id);
    return user;
  }

  @Public()
  @ResponseMessage("Social Login successfully")
  @Post("social-login")
  socialLogin(@Body() body: SocialLoginInput) {
    return this.authService.handleSocialLogin(body);
  }
}
