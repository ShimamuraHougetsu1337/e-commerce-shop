import { login } from "@/utils/auth.api"
import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

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
        GithubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        })
    ],
    callbacks: {
        async jwt({ token, user, account, trigger, session }) {
            // Xử lý Social Login: Gọi backend NestJS để đồng bộ và lấy JWT
            if (account && (account.provider === 'google' || account.provider === 'github')) {
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
                        token.user = responseData.data.user;
                        token.accessToken = responseData.data.accessToken;
                    }
                } catch (error) {
                    console.error("Lỗi khi đồng bộ Social Login với backend:", error);
                }
            }
            // Xử lý Credentials Login
            else if (user) {
                // @ts-ignore
                token.user = user.user;
                // @ts-ignore
                token.accessToken = user.accessToken;
            }
            // Khi gọi update() từ client, cập nhật tên mới vào token
            if (trigger === 'update' && session?.name) {
                (token.user as any).name = session.name;
            }

            return token;
        },
        async session({ session, token }) {
            if (token && token.user) {
                session.user = token.user;
                session.accessToken = token.accessToken as string;
            }
            return session;
        }
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
