import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SocialLoginInput {
    @IsEmail({}, { message: 'Email is invalid' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'Provider is required' })
    provider: string;

    @IsString()
    @IsNotEmpty({ message: 'Provider Account ID is required' })
    providerAccountId: string;

    @IsOptional()
    @IsString()
    avatar?: string;
}

export interface OAuthResponseData {
    accessToken: string;
    user: any;
}
