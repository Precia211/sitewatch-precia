

"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "viewer";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("viewer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError || !data.user) {
        setError(loginError?.message || "Login failed.");
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError("Unable to verify your account role.");
        return;
      }

      if (
        String(profile.role).toLowerCase() !== selectedRole
      ) {
        await supabase.auth.signOut();
        setError(
          `This account is not registered as ${selectedRole}. Please select the correct login type.`
        );
        return;
      }

      router.push("/");
      router.refresh();

    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setSuccess(
        "If an account exists with this email, a password reset link will be sent. Please check your inbox."
      );

    } catch {
      setError("Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-5">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            SW
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Site Watch
          </h1>

          <p className="text-gray-500 mt-2">
            Secure Monitoring System
          </p>
        </div>

        {forgotMode ? (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Forgot Password?
            </h2>

            <p className="text-gray-500 text-sm mb-6">
              Enter your registered email address and we will send
              you a password reset link.
            </p>

            <form onSubmit={handleForgotPassword} className="space-y-5">

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
                  placeholder="Enter your registered email"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black text-white p-3 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-sm text-gray-600 hover:text-black"
              >
                ← Back to Login
              </button>

            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome Back
            </h2>

            <p className="text-gray-500 text-sm mb-6">
              Select your account type to continue.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Account type */}
              <div>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Login As
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => setSelectedRole("admin")}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      selectedRole === "admin"
                        ? "border-black bg-gray-100"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-2xl">🛡️</span>
                    <p className="font-semibold mt-2 text-gray-900">
                      Admin
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Manage system
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("viewer")}
                    className={`rounded-xl border-2 p-4 text-left transition ${
                      selectedRole === "viewer"
                        ? "border-black bg-gray-100"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-2xl">👁️</span>
                    <p className="font-semibold mt-2 text-gray-900">
                      Viewer
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      View monitoring
                    </p>
                  </button>

                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-black"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 p-3 pr-20 outline-none focus:border-black"
                    placeholder="Enter your password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-sm text-gray-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black text-white p-3 font-semibold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>

            </form>
          </>
        )}

        <p className="text-center text-xs text-gray-400 mt-8">
          Site Watch © 2026. Secure Monitoring System.
        </p>

      </div>
    </main>
  );
}
