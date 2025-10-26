import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { loginSchema } from "@/utils/validation";
import { sanitizeErrorMessage } from "@/utils/errorHandling";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['auth', 'meta']);
  const { login, loginWithGoogle, loginWithFacebook, isAuthenticated, isLoading, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  
  useEffect(() => {
    // Redirect to the previous page or home if already authenticated
    if (isAuthenticated) {
      const from = (location.state as Record<string, unknown>)?.from as string || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate inputs
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      setError(firstError.message);
      toast.error(firstError.message);
      return;
    }
    
    try {
      await login(validationResult.data.email, validationResult.data.password);
      // Navigation will happen automatically via the useEffect
    } catch (err) {
      // Error is handled by the login function with toast
      const errorMessage = err instanceof Error ? err.message : t('auth:messages.invalidCredentials');
      setError(errorMessage);
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

  const handleFacebookLogin = async () => {
    try {
      await loginWithFacebook();
    } catch (err) {
      // Error is handled by the loginWithFacebook function with toast
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailValidation = loginSchema.shape.email.safeParse(resetEmail);
    if (!emailValidation.success) {
      toast.error(emailValidation.error.errors[0].message);
      return;
    }
    
    if (!resetEmail) {
      toast.error(t('auth:messages.enterEmail'));
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
              <CardTitle className="text-2xl font-bubbly">{t('auth:resetPassword.title')}</CardTitle>
              <CardDescription>{t('auth:resetPassword.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">{t('auth:common.emailLabel')}</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder={t('auth:common.emailPlaceholder')}
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      autoComplete="username"
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
                      {t('auth:resetPassword.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-primary-foreground hover:bg-primary"
                      disabled={resetSubmitting}
                    >
                      {resetSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('auth:resetPassword.sending')}
                        </>
                      ) : (
                        t('auth:resetPassword.sendButton')
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
            <CardTitle className="text-2xl font-bubbly">{t('auth:login_page.title')}</CardTitle>
            <CardDescription>{t('auth:login_page.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth:common.emailLabel')}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('auth:common.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t('auth:common.passwordLabel')}</Label>
                    <button
                      type="button"
                      onClick={() => setIsResetting(true)}
                      className="text-xs text-primary-foreground hover:underline"
                    >
                      {t('auth:login_page.forgotPassword')}
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                
                {error && (
                  <p className="text-destructive text-sm">{sanitizeErrorMessage(error)}</p>
                )}
                
                <Button
                  type="submit"
                  className="w-full "
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth:login_page.signingIn')}
                    </>
                  ) : (
                    t('auth:login_page.signInButton')
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
                    {t('auth:common.orContinueWith')}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  {t('auth:common.google')}
                </Button>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                >
                  {t('auth:common.facebook')}
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth:login_page.noAccount')}{" "}
              <Link to="/register" className="text-primary-foreground hover:underline">
                {t('auth:login_page.signUpLink')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
