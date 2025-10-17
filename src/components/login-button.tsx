"use client";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const router = useRouter();
  const handleLogin = () => {
    router.push("/login");
  };

  return <Button onClick={handleLogin}>Login</Button>;
}
