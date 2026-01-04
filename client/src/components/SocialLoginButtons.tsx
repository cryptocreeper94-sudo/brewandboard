import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Fingerprint, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";

interface SocialLoginButtonsProps {
  onSuccess?: (user: any) => void;
  showPinLogin?: boolean;
}

type AuthView = 'main' | 'email' | 'forgot-password';

export function SocialLoginButtons({ onSuccess, showPinLogin = false }: SocialLoginButtonsProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showPinForm, setShowPinForm] = useState(false);
  const [authView, setAuthView] = useState<AuthView>('main');
  const [isSignUp, setIsSignUp] = useState(false);
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const handleReplitLogin = () => {
    window.location.href = "/api/login";
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

    if (isSignUp && password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setIsLoading("email");
    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp ? { email, password, name: name || email.split('@')[0] } : { email, password };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("coffee_user", JSON.stringify(data.user));
        localStorage.setItem("coffee_session_expiry", String(Date.now() + 30 * 24 * 60 * 60 * 1000));
        onSuccess?.(data.user);
        setLocation("/dashboard");
      } else {
        const error = await res.json();
        throw new Error(error.error || (isSignUp ? "Registration failed" : "Login failed"));
      }
    } catch (error: any) {
      toast({
        title: isSignUp ? "Registration Failed" : "Login Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading("forgot");
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (res.ok) {
        setForgotPasswordSent(true);
        toast({
          title: "Check Your Email",
          description: "If an account exists, you'll receive a password reset link.",
        });
      } else {
        const error = await res.json();
        throw new Error(error.error || "Request failed");
      }
    } catch (error: any) {
      toast({
        title: "Request Failed",
        description: error.message,
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

  const resetForms = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPin("");
    setShowPinForm(false);
    setForgotPasswordSent(false);
  };

  if (authView === 'forgot-password') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setAuthView('email'); setForgotPasswordSent(false); }}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          data-testid="button-back-to-login"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </button>

        {forgotPasswordSent ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">Check Your Email</h3>
            <p className="text-gray-600 text-sm">
              If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <Button
              onClick={() => { setAuthView('main'); resetForms(); }}
              variant="outline"
              className="mt-4"
              data-testid="button-back-to-main"
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800">Forgot Password</h3>
            <p className="text-sm text-gray-600">Enter your email and we'll send you a reset link.</p>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="h-12 bg-white border-gray-300"
              data-testid="input-forgot-email"
            />
            <Button
              onClick={handleForgotPassword}
              disabled={isLoading !== null || !email}
              className="w-full bg-[#5c4033] hover:bg-[#4a3429] text-white"
              data-testid="button-send-reset"
            >
              {isLoading === "forgot" ? "Sending..." : "Send Reset Link"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (authView === 'email') {
    return (
      <div className="space-y-4">
        <button
          onClick={() => { setAuthView('main'); resetForms(); }}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          data-testid="button-back-to-main"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

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
          
          {isSignUp && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name (optional)"
              className="h-12 bg-white border-gray-300"
              data-testid="input-name"
            />
          )}
          
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
          
          {!isSignUp && (
            <button
              onClick={() => setAuthView('forgot-password')}
              className="text-xs text-[#5c4033] hover:underline"
              data-testid="button-forgot-password"
            >
              Forgot password?
            </button>
          )}
          
          <Button
            onClick={handleEmailAuth}
            disabled={isLoading !== null || !email || !password}
            className="w-full bg-[#5c4033] hover:bg-[#4a3429] text-white"
            data-testid="button-submit-email"
          >
            {isLoading === "email" ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
          </Button>
        </div>
      </div>
    );
  }

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
        Sign in with Google, Apple, or GitHub
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

      <Button
        onClick={() => setAuthView('email')}
        variant="outline"
        className="w-full h-12 border-gray-300 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2"
        data-testid="button-show-email-login"
      >
        <Mail className="w-4 h-4" />
        Continue with Email
      </Button>

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
