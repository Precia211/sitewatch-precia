
"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setError("Unable to verify your reset link.");
      } else if (data.session) {
        setSessionReady(true);
      } else {
        setError(
          "Your reset link is invalid or expired. Please request a new one."
        );
      }

      setChecking(false);
    }

    checkSession();
  }, [supabase]);

  async function handleReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess("Your password has been updated successfully!");

      setPassword("");
      setConfirmPassword("");

      await supabase.auth.signOut();

      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-5">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        <div className="text-center mb-8">

          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            SW
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Site Watch
          </h1>

          <p className="text-gray-500 mt-2">
            Create a new password
          </p>

        </div>

        <h2 className="text-xl font-semibold mb-2">
          Reset Password
        </h2>

        <p className="text-sm text-gray-500 mb-6">
          Enter your new password below.
        </p>

        {checking ? (
          <p className="text-center text-gray-500">
            Verifying reset link...
          </p>
        ) : !sessionReady ? (
          <div className="space-y-4">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() => router.push("/login")}
              className="w-full rounded-xl bg-black text-white p-3"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">

            <div>
              <label className="block text-sm font-medium mb-2">
                New Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
                placeholder="Confirm new password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black text-white p-3 font-semibold hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>

          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Site Watch © 2026. Secure Monitoring System.
        </p>

      </div>
    </main>
  );
}
