import NextAuth, {DefaultSession} from "next-auth";

// Read more at: https://next-auth.js.org/getting-started/typescript#module-augmentation
declare module "next-auth" {
    interface Session {
        user: {
            id?: string
        } & DefaultSession["user"]
    }
    interface Account {

    }
}