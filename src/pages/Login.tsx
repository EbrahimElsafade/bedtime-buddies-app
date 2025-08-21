
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { PasswordResetForm } from "@/components/auth/PasswordResetForm";
import { OAuthButtons } from "@/components/auth/OAuthButtons";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithApple, isAuthenticated, isLoading, resetPassword } = useAuth();
  const [isResetting, setIsResetting] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  const handleAppleLogin = async () => {
    await loginWithApple();
  };

  const handlePasswordReset = async (email: string) => {
    await resetPassword(email);
  };

  if (isResetting) {
    return (
      <AuthCard
        title="Reset Password"
        description="We'll send you an email with reset instructions"
      >
        <PasswordResetForm
          onSubmit={handlePasswordReset}
          onCancel={() => setIsResetting(false)}
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Welcome Back"
      description="Sign in to access your bedtime stories"
      footer={
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-dream-DEFAULT hover:underline">
            Sign up
          </Link>
        </p>
      }
    >
      <LoginForm
        onSubmit={handleLogin}
        onForgotPassword={() => setIsResetting(true)}
        isLoading={isLoading}
      />
      <OAuthButtons
        onGoogleClick={handleGoogleLogin}
        onAppleClick={handleAppleLogin}
        isLoading={isLoading}
      />
    </AuthCard>
  );
};

export default Login;
