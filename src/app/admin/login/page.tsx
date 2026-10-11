import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { hasValidSession, loginRequired } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Nothing to sign in to when no password is configured (local development).
  if (!loginRequired() || (await hasValidSession())) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-fun-gray">
        This area is for editing the site&apos;s projects.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </div>
  );
}
