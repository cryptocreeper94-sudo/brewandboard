import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Coffee, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [errorMessage, setErrorMessage] = useState("");

  const token = new URLSearchParams(search).get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid or missing reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in both password fields",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

      if (res.ok) {
        setStatus('success');
      } else {
        const error = await res.json();
        setStatus('error');
        setErrorMessage(error.error || 'Failed to reset password');
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div 
            className="p-6 text-center"
            style={{ background: 'linear-gradient(135deg, #1a0f0a 0%, #2d1810 100%)' }}
          >
            <div className="h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}>
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <h1 
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Brew & Board Coffee
            </h1>
            <p className="text-amber-400/80 text-sm mt-1">Reset Your Password</p>
          </div>

          <div className="p-6">
            {status === 'success' ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-800">Password Reset Successfully!</h3>
                <p className="text-gray-600 text-sm">
                  Your password has been updated. You can now sign in with your new password.
                </p>
                <Button
                  onClick={() => setLocation("/")}
                  className="mt-4 bg-[#5c4033] hover:bg-[#4a3429] text-white"
                  data-testid="button-go-to-login"
                >
                  Go to Sign In
                </Button>
              </div>
            ) : status === 'error' ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-800">Reset Failed</h3>
                <p className="text-gray-600 text-sm">{errorMessage}</p>
                <Button
                  onClick={() => setLocation("/")}
                  variant="outline"
                  className="mt-4"
                  data-testid="button-back-to-login"
                >
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm text-center mb-4">
                  Enter your new password below.
                </p>
                
                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm font-medium">New Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="h-12 bg-white border-gray-300 pr-10"
                      data-testid="input-new-password"
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
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700 text-sm font-medium">Confirm Password</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="h-12 bg-white border-gray-300"
                    data-testid="input-confirm-password"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Password must be at least 6 characters long.
                </p>

                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !password || !confirmPassword}
                  className="w-full h-12 bg-[#5c4033] hover:bg-[#4a3429] text-white"
                  data-testid="button-reset-password"
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
