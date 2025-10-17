import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";

export function LoginForm({
  className,
  isLoading,
  ...props
}: React.ComponentProps<"form"> & { isLoading?: boolean }) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input id="password" name="password" type="password" required />
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 533.5 544.3"
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.3H272v95.1h146.9c-6.3 34-25.4 62.8-54.1 82v68.2h87.2c51-47 80-116 80-194z"
              />
              <path
                fill="#34A853"
                d="M272 544.3c73.6 0 135.5-24.4 180.7-66.4l-87.2-68.2c-24.3 16.3-55.3 25.9-93.5 25.9-71.9 0-132.9-48.5-154.7-113.6H29.1v71.5C74.6 491.6 168.8 544.3 272 544.3z"
              />
              <path
                fill="#FBBC05"
                d="M117.3 325.6c-10.9-32.8-10.9-68.5 0-101.3V152.8H29.1c-39.5 76.6-39.5 167.6 0 244.2l88.2-71.4z"
              />
              <path
                fill="#EA4335"
                d="M272 107.7c39 0 74 13.5 101.6 39.9l76.2-76.2C411.7 24 345.6 0 272 0 168.8 0 74.6 52.7 29.1 138.2l88.2 71.5C139.1 156.2 200.1 107.7 272 107.7z"
              />
            </svg>
            Login with Google
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
