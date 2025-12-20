import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  signInWithGoogle, 
  signInWithFacebook, 
  signInWithApple,
  isFirebaseConfigured 
} from "@/lib/firebase";

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
  const [firebaseEnabled, setFirebaseEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/auth/config')
      .then(res => res.json())
      .then(data => setFirebaseEnabled(data.firebaseConfigured))
      .catch(() => setFirebaseEnabled(false));
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading("google");
    try {
      const result = await signInWithGoogle();
      if (result) {
        const res = await fetch('/api/auth/firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: result.idToken })
        });
        
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("coffee_user", JSON.stringify(data.user));
          localStorage.setItem("coffee_session_expiry", String(Date.now() + 30 * 24 * 60 * 60 * 1000));
          onSuccess?.(data.user);
          setLocation("/dashboard");
        } else {
          throw new Error("Authentication failed");
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Google",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading("facebook");
    try {
      const result = await signInWithFacebook();
      if (result) {
        const res = await fetch('/api/auth/firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: result.idToken })
        });
        
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("coffee_user", JSON.stringify(data.user));
          localStorage.setItem("coffee_session_expiry", String(Date.now() + 30 * 24 * 60 * 60 * 1000));
          onSuccess?.(data.user);
          setLocation("/dashboard");
        } else {
          throw new Error("Authentication failed");
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Facebook",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading("apple");
    try {
      const result = await signInWithApple();
      if (result) {
        const res = await fetch('/api/auth/firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: result.idToken })
        });
        
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("coffee_user", JSON.stringify(data.user));
          localStorage.setItem("coffee_session_expiry", String(Date.now() + 30 * 24 * 60 * 60 * 1000));
          onSuccess?.(data.user);
          setLocation("/dashboard");
        } else {
          throw new Error("Authentication failed");
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Could not sign in with Apple",
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
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
      {firebaseEnabled && (
        <>
          <Button
            onClick={handleGoogleLogin}
            disabled={isLoading !== null}
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium flex items-center justify-center gap-3"
            data-testid="button-login-google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading === "google" ? "Signing in..." : "Continue with Google"}
          </Button>

          <Button
            onClick={handleAppleLogin}
            disabled={isLoading !== null}
            className="w-full h-12 bg-black hover:bg-gray-900 text-white rounded-lg font-medium flex items-center justify-center gap-3"
            data-testid="button-login-apple"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            {isLoading === "apple" ? "Signing in..." : "Continue with Apple"}
          </Button>

          <Button
            onClick={handleFacebookLogin}
            disabled={isLoading !== null}
            className="w-full h-12 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg font-medium flex items-center justify-center gap-3"
            data-testid="button-login-facebook"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {isLoading === "facebook" ? "Signing in..." : "Continue with Facebook"}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
        </>
      )}

      {showPinLogin && (
        <>
          {!showPinForm ? (
            <Button
              onClick={() => setShowPinForm(true)}
              variant="outline"
              className="w-full h-12 border-gray-300 text-gray-700 rounded-lg font-medium"
              data-testid="button-show-pin-login"
            >
              Admin / Beta Tester Login
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

      {!firebaseEnabled && !showPinLogin && (
        <p className="text-center text-gray-500 text-sm">
          Social login will be available soon. Continue as guest to explore.
        </p>
      )}
    </div>
  );
}
