import { DefaultSession } from "next-auth"
import "next-auth/jwt"

declare module "next-auth/jwt" {
    interface JWT {
        accessToken: string;
        refreshToken: string;
        accessTokenExpires: number;
        user: any;
        error?: "RefreshAccessTokenError";
    }
}

declare module "next-auth" {
    interface Session {
        accessToken: string;
        refreshToken: string;
        error?: "RefreshAccessTokenError";
        user: {
            _id?: string;
            role?: string;
            phone?: string;
            address?: string;
            avatar?: string;
            sendOrderToEmail?: boolean;
        } & DefaultSession["user"];
    }
}
