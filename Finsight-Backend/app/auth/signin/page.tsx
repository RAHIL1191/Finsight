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

      <style jsx>{`
        .signin-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
          color: #fff;
          font-family: 'Inter', sans-serif;
          padding: 1rem;
        }

        .signin-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 3rem 2.5rem;
          border-radius: 24px;
          text-align: center;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .logo {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.05em;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #fff 0%, #a1a1aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .subtitle {
          color: #a1a1aa;
          margin-bottom: 2.5rem;
          font-size: 0.95rem;
        }

        .google-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: #fff;
          color: #000;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .google-button:hover {
          background: #f1f1f1;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
        }

        .google-button:active {
          transform: translateY(0);
        }

        .footer {
          margin-top: 2rem;
          font-size: 0.75rem;
          color: #52525b;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="signin-container">
        <div className="loading">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
