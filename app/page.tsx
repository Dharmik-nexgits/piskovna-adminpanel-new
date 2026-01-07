"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("userdata");

    if (token && userData) {
      router.replace("/blog");
    } else {
      router.replace("/login");
    }
  }, [router]);

  // While checking or redirecting, render nothing or a simple loader
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Optional: Add a spinner here */}
    </div>
  );
}
