"use client";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AuthButton({ className }: { className?: string }) {
  return (
    <Button className={cn(className)} onClick={() => signIn("google")}>
      Sign In with Google
    </Button>
  );
}
