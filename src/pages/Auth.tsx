import { PageBackdrop, Wordmark } from "@/components/quiza/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Couldn't start a guest session: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="studio-light flex min-h-screen flex-col">
      <PageBackdrop />

      {/* Minimal top bar */}
      <header className="px-5 pt-6 sm:px-8">
        <Wordmark />
      </header>

      <div className="flex flex-1 items-center justify-center px-5 pb-24 pt-6">
        <div className="edge-glow animate-rise w-full max-w-[400px] rounded-2xl border hairline bg-[var(--qz-surface-1)] p-8 shadow-[var(--shadow-elevated)]">
          {step === "signIn" ? (
            <>
              <p className="eyebrow">Welcome to Quiza</p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight">
                Sign in or create an account
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-secondary">
                We'll email you a one-time code — no password to remember.
              </p>

              <form onSubmit={handleEmailSubmit} className="mt-7">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-qz" />
                  <Input
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    type="email"
                    autoComplete="email"
                    className="h-11 rounded-xl border-white/10 bg-white/[0.03] pl-10 text-[15px]"
                    disabled={isLoading}
                    required
                  />
                </div>
                {error && (
                  <p className="mt-2.5 text-sm text-rose-300" role="alert">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  data-cursor="hover"
                  className="btn-specular mt-4 h-11 w-full rounded-xl text-sm font-semibold"
                >
                  {isLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      Continue <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t hairline-faint" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[var(--qz-surface-1)] px-3 text-xs text-muted-qz">
                    or
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGuestLogin}
                disabled={isLoading}
                className="h-11 w-full rounded-xl border-white/10 bg-transparent text-sm font-medium text-secondary hover:bg-white/[0.05] hover:text-[var(--qz-text)]"
              >
                Continue as guest
              </Button>
            </>
          ) : (
            <>
              <p className="eyebrow">Check your inbox</p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight">
                Enter your code
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-secondary">
                Sent to{" "}
                <span className="font-medium text-[var(--qz-text)]">{step.email}</span>.
              </p>

              <form onSubmit={handleOtpSubmit} className="mt-7">
                <input type="hidden" name="email" value={step.email} />
                <input type="hidden" name="code" value={otp} />

                <div className="flex justify-center [&_div]:gap-2">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                        const form = (e.target as HTMLElement).closest("form");
                        form?.requestSubmit();
                      }
                    }}
                  >
                    <InputOTPGroup>
                      {Array.from({ length: 6 }).map((_, index) => (
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p className="mt-4 text-center text-sm text-rose-300" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  data-cursor="hover"
                  className="btn-specular mt-6 h-11 w-full rounded-xl text-sm font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Verifying…
                    </>
                  ) : (
                    <>
                      Verify code <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-5 flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep("signIn")}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 text-muted-qz transition-colors hover:text-secondary"
                >
                  <ArrowRight className="size-3.5 rotate-180" /> Use another email
                </button>
                <span className="text-xs text-muted-qz">Code expires shortly</span>
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="pb-8 text-center text-xs text-muted-qz">
        Secured by one-time codes · Your scores stay yours
      </footer>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
