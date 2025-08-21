
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthCard } from '@/components/auth/AuthCard';
import { RegisterStepOne } from '@/components/auth/RegisterStepOne';
import { RegisterStepTwo } from '@/components/auth/RegisterStepTwo';
import { OAuthButtons } from '@/components/auth/OAuthButtons';

const Register = () => {
  const navigate = useNavigate();
  const {
    register: signUp,
    loginWithGoogle,
    loginWithApple,
    isAuthenticated,
    isLoading,
  } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [language, setLanguage] = useState<'en' | 'ar-eg' | 'ar-fos7a' | 'fr'>('ar-fos7a');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleNextStep = () => {
    if (!name || !email || !password) {
      setError('Please fill all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    setError('');
    try {
      await signUp(email, password, name, childName || undefined, language);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  };

  const handleGoogleSignUp = async () => {
    await loginWithGoogle();
  };

  const handleAppleSignUp = async () => {
    await loginWithApple();
  };

  return (
    <AuthCard
      title="Create an Account"
      description={
        currentStep === 1
          ? 'Join us for magical bedtime stories'
          : 'Tell us about your little one'
      }
      footer={
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-dream-DEFAULT hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {currentStep === 1 ? (
        <>
          <RegisterStepOne
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onNext={handleNextStep}
            error={error}
          />
          <OAuthButtons
            onGoogleClick={handleGoogleSignUp}
            onAppleClick={handleAppleSignUp}
            isLoading={isLoading}
          />
        </>
      ) : (
        <RegisterStepTwo
          childName={childName}
          setChildName={setChildName}
          childAge={childAge}
          setChildAge={setChildAge}
          language={language}
          setLanguage={setLanguage}
          onBack={() => setCurrentStep(1)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
      )}
    </AuthCard>
  );
};

export default Register;
