import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['auth', 'meta']);
  const { login, loginWithGoogle, loginWithApple, isAuthenticated, isLoading, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  
  useEffect(() => {
    // Redirect to home if already authenticated
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    try {
      await login(email, password);
      // Navigation will happen automatically via the useEffect
    } catch (err: any) {
      // Error is handled by the login function with toast
      setError(err.message || "Invalid email or password");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // OAuth will redirect the user
    } catch (err) {
      // Error is handled by the loginWithGoogle function with toast
    }
  };

  const handleAppleLogin = async () => {
    try {
      await loginWithApple();
      // OAuth will redirect the user
    } catch (err) {
      // Error is handled by the loginWithApple function with toast
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    
    setResetSubmitting(true);
    
    try {
      await resetPassword(resetEmail);
      setIsResetting(false);
      setResetEmail("");
    } catch (err) {
      // Error is handled by resetPassword function
    } finally {
      setResetSubmitting(false);
    }
  };

  if (isResetting) {
    return (
      <div className="py-12 px-4 bg-gradient-to-b from-primary/20 to-primary/10 flex items-center justify-center min-h-[82.7vh]">
        <div className="w-full max-w-md">
          <Card className="border-primary/20 bg-secondary/70  backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bubbly">Reset Password</CardTitle>
              <CardDescription>We'll send you an email with reset instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="hello@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsResetting(false)}
                      disabled={resetSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-primary-foreground hover:bg-primary"
                      disabled={resetSubmitting}
                    >
                      {resetSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Instructions"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 bg-gradient-to-b from-primary/20 to-primary/10 flex items-center justify-center min-h-[82.7vh]">
      <Helmet>
        <title>{t('meta:titles.login')}</title>
        <meta name="description" content={t('meta:descriptions.login')} />
        <meta property="og:title" content={t('meta:titles.login')} />
        <meta property="og:description" content={t('meta:descriptions.login')} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full max-w-md">
        <Card className="border-primary/20 bg-secondary/70  backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bubbly">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your Dolphoon</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="hello@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setIsResetting(true)}
                      className="text-xs text-primary-foreground hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
                
                <Button
                  type="submit"
                  className="w-full bg-primary-foreground hover:bg-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-secondary  px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleAppleLogin}
                  disabled={isLoading}
                >
                  Apple
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary-foreground hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
