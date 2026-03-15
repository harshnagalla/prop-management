import { AuthView } from "@neondatabase/auth/react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <AuthView pathname="sign-in" />
    </div>
  );
}
