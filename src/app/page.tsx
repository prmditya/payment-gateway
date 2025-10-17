"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoaderIcon } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/home");
  }, [router]);
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoaderIcon className="animate-spin" size={48} />
    </div>
  );
}
