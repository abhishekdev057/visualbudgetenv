import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";
export const metadata = { title: "Sign in" };
export default async function SignInPage({searchParams}:{searchParams:Promise<{oauth?:string}>}) { if (await getCurrentUser()) redirect("/"); const {oauth}=await searchParams; return <AuthForm mode="sign-in" oauthError={oauth} />; }
