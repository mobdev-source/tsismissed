"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle } from "lucide-react";
import { AuthForm } from "@/components/AuthForm";
import { sendPasswordResetEmail } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? friendlyError(err.message) : "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthForm
      title="Reset your password"
      footer={
        <Link href="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle size={40} className="text-green-500" />
          <p className="text-sm text-gray-600">
            Password reset link sent to <strong>{email}</strong>. Check your inbox.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Enter your email and we&apos;ll send you a reset link.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 text-sm disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Send Reset Link
          </button>
        </form>
      )}
    </AuthForm>
  );
}

function friendlyError(msg: string): string {
  if (msg.includes("user-not-found")) return "No account found with this email.";
  if (msg.includes("invalid-email")) return "Invalid email address.";
  return "Failed to send reset email. Please try again.";
}
