import { login } from "@/utils/auth.api"
import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import FacebookProvider from "next-auth/providers/facebook"
import GoogleProvider from "next-auth/providers/google"

async function refreshAccessToken(token: any) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: token.refreshToken })
        });

        const responseData = await res.json();

        if (!res.ok || !responseData.data) {
            throw responseData;
        }

        return {
            ...token,
            accessToken: responseData.data.accessToken,
            refreshToken: responseData.data.refreshToken ?? token.refreshToken, // Fallback to old refresh token if not provided
            accessTokenExpires: Date.now() + responseData.data.expiresIn * 1000,
        };
    } catch (error) {
        console.error("Error refreshing access token", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions: AuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const res = await login(credentials?.username!, credentials?.password!)

                if (res?.data) {
                    return res.data as any
                } else {
                    return null
                }
            }
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        })
    ],
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            // Initial sign in
            if (user && account) {
                if (account.provider === 'credentials') {
                    return {
                        accessToken: (user as any).accessToken,
                        refreshToken: (user as any).refreshToken,
                        accessTokenExpires: Date.now() + (user as any).expiresIn * 1000,
                        user: (user as any).user,
                    };
                } else {
                    // Social Login: Gọi backend NestJS để đồng bộ và lấy JWT
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/social-login`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                email: user?.email,
                                name: user?.name,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                avatar: user?.image
                            })
                        });

                        const responseData = await res.json();

                        if (res.ok && responseData.data) {
                            return {
                                accessToken: responseData.data.accessToken,
                                refreshToken: responseData.data.refreshToken,
                                accessTokenExpires: Date.now() + responseData.data.expiresIn * 1000,
                                user: responseData.data.user,
                            };
                        }
                    } catch (error) {
                        console.error("Lỗi khi đồng bộ Social Login với backend:", error);
                    }
                }
            }

            // Khi gọi update() từ client, cập nhật thông tin mới vào token
            if (trigger === 'update' && session) {
                if (!token.user) token.user = {};
                token.user = {
                    ...token.user,
                    ...(session.name !== undefined && { name: session.name }),
                    ...(session.phone !== undefined && { phone: session.phone }),
                    ...(session.address !== undefined && { address: session.address }),
                    ...(session.avatar !== undefined && { avatar: session.avatar }),
                    ...(session.sendOrderToEmail !== undefined && { sendOrderToEmail: session.sendOrderToEmail }),
                };
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < (token as any).accessTokenExpires) {
                return token;
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token);
        },
        async session({ session, token }) {
            if (token) {
                session.user = token.user as any;
                session.accessToken = token.accessToken as string;
                session.refreshToken = token.refreshToken as string;
                session.error = token.error as any;
            }
            return session;
        }
    },
}
