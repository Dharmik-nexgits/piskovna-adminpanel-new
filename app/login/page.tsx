"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("userdata");

    if (token && userData) {
      router.replace("/blog");
    } else {
      setLoading(false);
    }
  }, [router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (
      credentials.email !== "admin@piskovna.com" ||
      credentials.password !== "Admin@123"
    ) {
      setError("Neplatný e-mail nebo heslo");
      return;
    }

    // Generate mock JWT token
    const mockToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
      btoa(JSON.stringify({ email: credentials.email, id: Date.now() })) +
      ".mocksignature_" +
      Date.now();

    // Store in localStorage as requested
    localStorage.setItem("auth_token", mockToken);
    localStorage.setItem("userdata", JSON.stringify(credentials));

    // Redirect
    router.replace("/blog");
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-white text-center">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-center mb-8">
            <img
              src="/images/logo.svg"
              alt="Erawine"
              className="h-24 w-auto object-contain"
            />
          </div>
          <h2 className="text-gray-500 text-lg mb-8">
            Přihlaste se pro pokračování do administrace Pískovna.
          </h2>

          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <Input
              id="email"
              type="email"
              label="E-mail"
              placeholder="Zadejte e-mail"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              required
            />

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Heslo
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Zadejte heslo"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  required
                  className="pr-10" // Make room for the eye icon
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none z-10"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              Přihlásit se
            </Button>
          </form>
          <div className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Piskovna
          </div>
        </div>
      </div>

      {/* Right Side - Image Banner */}
      <div className="hidden lg:block w-1/2 relative bg-black">
        <Image
          src="/images/banner-bg.webp"
          alt="Wine Cellar"
          fill
          className="object-cover opacity-80"
          priority
        />
      </div>
    </div>
  );
}
