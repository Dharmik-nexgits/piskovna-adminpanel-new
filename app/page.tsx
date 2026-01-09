"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "./loading";
import { useAppContext } from "@/contexts/AppContext";

export default function Home() {
  const router = useRouter();
  const contextValues = useAppContext();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("userdata");

    if (token && userData) {
      router.replace("/blog");
    } else {
      router.replace("/login");
    }
    contextValues.setStore({ isLoading: false });
  }, [contextValues.setStore, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loading isLoading={contextValues.store.isLoading} />
    </div>
  );
}
