"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h1 className="logo">FinSight</h1>
        <p className="subtitle">Securely connect your financial workspace</p>
        
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="google-button"
        >
          <img 
            src="https://authjs.dev/img/providers/google.svg" 
            alt="Google" 
            width={24} 
            height={24} 
          />
          <span>Continue with Google</span>
        </button>

        <p className="footer">
          By continuing, you agree to FinSight's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="signin-container">
        <div className="loading-text">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
