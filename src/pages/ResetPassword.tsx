import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from 'react-i18next';
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['auth', 'meta']);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t('auth:resetPassword.invalidLink'));
        navigate('/login');
      }
    };
    
    checkSession();
  }, [navigate, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t('auth:messages.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth:messages.passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success(t('auth:resetPassword.success'));
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="py-12 px-4 bg-gradient-to-b from-primary/20 to-primary/10 flex items-center justify-center min-h-[82.7vh]">
        <Card className="border-primary/20 bg-secondary/70 backdrop-blur-sm w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('auth:resetPassword.success')}</h2>
            <p className="text-muted-foreground">{t('auth:resetPassword.redirecting')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 bg-gradient-to-b from-primary/20 to-primary/10 flex items-center justify-center min-h-[82.7vh]">
      <Helmet>
        <title>{t('auth:resetPassword.title')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full max-w-md">
        <Card className="border-primary/20 bg-secondary/70 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bubbly">{t('auth:resetPassword.setNewPassword')}</CardTitle>
            <CardDescription>{t('auth:resetPassword.enterNewPassword')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth:common.newPassword')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth:common.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
                
                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth:resetPassword.updating')}
                    </>
                  ) : (
                    t('auth:resetPassword.updatePassword')
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;