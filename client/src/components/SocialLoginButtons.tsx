import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Fingerprint, Mail, Chrome, Eye, EyeOff } from "lucide-react";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, getFirebaseIdToken } from "@/lib/firebase";

interface SocialLoginButtonsProps {
  onSuccess?: (user: any) => void;
  showPinLogin?: boolean;
}

interface AuthConfig {
  firebase: boolean;
  providers: {
    google: boolean;
    email: boolean;
  };
}

export function SocialLoginButtons({ onSuccess, showPinLogin = false }: SocialLoginButtonsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showPinForm, setShowPinForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authConfig, setAuthConfig] = useState<AuthConfig | null>(null);

  useEffect(() => {
    fetch('/api/auth/config')
      .then(res => res.json())
      .then(config => setAuthConfig(config))
      .catch(() => setAuthConfig({ firebase: false, providers: { google: false, email: false } }));
  }, []);

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
  };

  const verifyFirebaseWithBackend = async () => {
    const idToken = await getFirebaseIdToken();
    if (!idToken) throw new Error("Failed to get authentication token");
    
    const res = await fetch('/api/auth/firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Authentication failed");
    }
    
    return res.json();
  };

  const handleGoogleLogin = async () => {
    setIsLoading("google");
    try {
      await signInWithGoogle();
      const data = await verifyFirebaseWithBackend();
      localStorage.setItem("coffee_user", JSON.stringify(data.user));
      localStorage.setItem("coffee_session_expiry", String(Date.now() + 30 * 24 * 60 * 60 * 1000));
      onSuccess?.(data.user);
      setLocation("/dashboard");
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast({
          title: "Login Failed",
          description: error.message || "Could not sign in with Google",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading("email");
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      const data = await verifyFirebaseWithBackend();
      localStorage.setItem("coffee_user", JSON.stringify(data.user));
      localStorage.setItem("coffee_session_expiry", String(Date.now() + 30 * 24 * 60 * 60 * 1000));
      onSuccess?.(data.user);
      setLocation("/dashboard");
    } catch (error: any) {
      let message = error.message;
      if (error.code === 'auth/user-not-found') message = "No account found with this email";
      if (error.code === 'auth/wrong-password') message = "Incorrect password";
      if (error.code === 'auth/email-already-in-use') message = "Email already in use";
      if (error.code === 'auth/weak-password') message = "Password must be at least 6 characters";
      if (error.code === 'auth/invalid-email') message = "Invalid email address";
      toast({
        title: isSignUp ? "Sign Up Failed" : "Login Failed",
        description: message,
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

  const firebaseEnabled = authConfig?.firebase;

  return (
    <div className="space-y-4">
      {firebaseEnabled && (
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading !== null}
          className="w-full h-12 text-white rounded-lg font-medium flex items-center justify-center gap-3"
          style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 50%, #2d1810 100%)' }}
          data-testid="button-login-google"
        >
          <Chrome className="w-5 h-5" />
          {isLoading === "google" ? "Signing in..." : "Sign in with Google"}
        </Button>
      )}

      <Button
        onClick={handleReplitLogin}
        disabled={isLoading !== null}
        className={firebaseEnabled ? "w-full h-12 border-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-3" : "w-full h-12 text-white rounded-lg font-medium flex items-center justify-center gap-3"}
        variant={firebaseEnabled ? "outline" : "default"}
        style={!firebaseEnabled ? { background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 50%, #2d1810 100%)' } : undefined}
        data-testid="button-login-replit"
      >
        <LogIn className="w-5 h-5" />
        {firebaseEnabled ? "Sign in with Replit" : "Sign in with Google, Apple, or GitHub"}
      </Button>

      {!firebaseEnabled && (
        <p className="text-center text-gray-500 text-xs">
          Secure login via Replit with biometric support
        </p>
      )}

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or</span>
        </div>
      </div>

      {firebaseEnabled && (
        !showEmailForm ? (
          <Button
            onClick={() => setShowEmailForm(true)}
            variant="outline"
            className="w-full h-12 border-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
            data-testid="button-show-email-login"
          >
            <Mail className="w-4 h-4" />
            Continue with Email
          </Button>
        ) : (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <Label className="text-gray-700 text-sm font-medium">
                {isSignUp ? "Create Account" : "Sign In with Email"}
              </Label>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-[#5c4033] hover:underline"
              data-testid="button-toggle-signup"
            >
              {isSignUp ? "Already have an account?" : "Need an account?"}
            </button>
          </div>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="h-12 bg-white border-gray-300"
            data-testid="input-email"
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-12 bg-white border-gray-300 pr-10"
              data-testid="input-password"
              onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              data-testid="button-toggle-password"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleEmailAuth}
              disabled={isLoading !== null || !email || !password}
              className="flex-1 bg-[#5c4033] hover:bg-[#4a3429] text-white"
              data-testid="button-submit-email"
            >
              {isLoading === "email" ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
            <Button
              onClick={() => {
                setShowEmailForm(false);
                setEmail("");
                setPassword("");
              }}
              variant="ghost"
              className="text-gray-500"
              data-testid="button-cancel-email"
            >
              Cancel
            </Button>
          </div>
        </div>
        )
      )}

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
