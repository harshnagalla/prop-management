"use client";

import { AuthView } from "@neondatabase/auth/react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <AuthView pathname="sign-up" />
    </div>
  );
}
