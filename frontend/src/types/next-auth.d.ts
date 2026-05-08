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
            role?: string;
        } & DefaultSession["user"];
    }
}
