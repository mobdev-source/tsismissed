"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getUserDoc } from "@/lib/firestore";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    getUserDoc(user.uid).then((profile) => {
      if (!profile?.displayName) {
        router.push("/profile");
      } else {
        router.push("/chat");
      }
    });
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-blue-600" />
    </div>
  );
}
