import { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { Loader2 } from "lucide-react";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.972 32.91 29.418 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20c11.045 0 20-8.955 20-20 0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.397 0-9.937-3.067-11.282-7.541l-6.523 5.025C9.51 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.001-.001 6.19 5.238C36.973 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true" fill="#FFFFFF">
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06C2 17.08 5.66 21.24 10.44 22v-7.03H7.9v-2.91h2.54V9.84c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.45 2.91h-2.33V22C18.34 21.24 22 17.08 22 12.06z"/>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(['auth', 'meta']);
  const { loginWithGoogle, loginWithFacebook, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as Record<string, unknown>)?.from as string || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleGoogleLogin = async () => {
    try { await loginWithGoogle(); } catch { /* handled */ }
  };

  const handleFacebookLogin = async () => {
    try { await loginWithFacebook(); } catch { /* handled */ }
  };

  return (
    <div className="py-12 px-4 bg-gradient-to-b from-primary/20 to-primary/10 flex items-center justify-center min-h-[82.7vh]">
      <Helmet>
        <title>{t('meta:titles.login')}</title>
        <meta name="description" content={t('meta:descriptions.login')} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full max-w-md">
        <Card className="border-primary/20 bg-secondary/70 shadow-xl backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bubbly">{t('auth:login_page.title')}</CardTitle>
            <CardDescription>{t('auth:login_page.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full justify-center gap-3 rounded-xl border-2 bg-white py-6 text-base font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
              <span>{t('auth:common.continueWithGoogle', { defaultValue: 'Continue with Google' })}</span>
            </Button>

            <Button
              type="button"
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className="w-full justify-center gap-3 rounded-xl bg-[#1877F2] py-6 text-base font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#166fe0] hover:shadow-md"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FacebookIcon />}
              <span>{t('auth:common.continueWithFacebook', { defaultValue: 'Continue with Facebook' })}</span>
            </Button>
          </CardContent>
          <CardFooter className="text-center">
            <p className="w-full text-sm text-muted-foreground">
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
