import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Fingerprint } from "lucide-react";

interface SocialLoginButtonsProps {
  onSuccess?: (user: any) => void;
  showPinLogin?: boolean;
}

export function SocialLoginButtons({ onSuccess, showPinLogin = false }: SocialLoginButtonsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showPinForm, setShowPinForm] = useState(false);
  const [pin, setPin] = useState("");

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };

  const handlePinLogin = async () => {
    if (!pin || pin.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter a valid PIN",
        variant: "destructive"
      });
      return;
    }

    setIsLoading("pin");
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("coffee_user", JSON.stringify(data.user));
        localStorage.setItem("coffee_session_expiry", String(Date.now() + 30 * 24 * 60 * 60 * 1000));
        onSuccess?.(data.user);
        setLocation("/dashboard");
      } else {
        const error = await res.json();
        throw new Error(error.error || "Invalid PIN");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleReplitLogin}
        disabled={isLoading !== null}
        className="w-full h-12 text-white rounded-lg font-medium flex items-center justify-center gap-3"
        style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 50%, #2d1810 100%)' }}
        data-testid="button-login-replit"
      >
        <LogIn className="w-5 h-5" />
        {isLoading === "replit" ? "Signing in..." : "Sign in with Google, Apple, or GitHub"}
      </Button>

      <p className="text-center text-gray-500 text-xs">
        Secure login via Replit with biometric support
      </p>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      {showPinLogin && (
        <>
          {!showPinForm ? (
            <Button
              onClick={() => setShowPinForm(true)}
              variant="outline"
              className="w-full h-12 border-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
              data-testid="button-show-pin-login"
            >
              <Fingerprint className="w-4 h-4" />
              Admin / Partner / Beta Tester Login
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Label className="text-gray-700 text-sm font-medium">Enter PIN</Label>
              <Input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                className="text-center text-2xl tracking-widest h-14 bg-white border-gray-300"
                data-testid="input-pin"
                onKeyDown={(e) => e.key === "Enter" && handlePinLogin()}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handlePinLogin}
                  disabled={isLoading !== null || pin.length < 4}
                  className="flex-1 bg-[#5c4033] hover:bg-[#4a3429] text-white"
                  data-testid="button-submit-pin"
                >
                  {isLoading === "pin" ? "Verifying..." : "Login"}
                </Button>
                <Button
                  onClick={() => {
                    setShowPinForm(false);
                    setPin("");
                  }}
                  variant="ghost"
                  className="text-gray-500"
                  data-testid="button-cancel-pin"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
