import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { buildRegisterSchema } from '@/utils/validation'

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

const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation(['auth', 'meta'])
  const {
    register: signUp,
    loginWithGoogle,
    loginWithFacebook,
    isAuthenticated,
    isLoading,
  } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [language, setLanguage] = useState<'en' | 'ar-eg' | 'ar-fos7a' | 'fr'>(
    'ar-fos7a',
  )
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    // Redirect to the previous page or home if already authenticated
    if (isAuthenticated) {
      const from = (location.state as Record<string, unknown>)?.from as string || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleNextStep = () => {
    // Validate step 1 inputs
    const validationResult = buildRegisterSchema(t).pick({
      parentName: true,
      email: true,
      password: true
    }).safeParse({
      parentName: name,
      email,
      password
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      setError(firstError.message);
      toast.error(firstError.message);
      return;
    }

    setError('')
    setCurrentStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate all inputs
    const validationResult = buildRegisterSchema(t).safeParse({
      parentName: name,
      email,
      password,
      childName: childName || undefined,
      preferredLanguage: language
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      setError(firstError.message);
      toast.error(firstError.message);
      return;
    }

    try {
      await signUp(
        validationResult.data.email,
        validationResult.data.password,
        validationResult.data.parentName,
        validationResult.data.childName,
        validationResult.data.preferredLanguage
      );
      // Redirect will happen through the useEffect if authentication is successful
      // Otherwise, user will stay on the page to verify their email
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth:register.errors.createFailed');
      setError(errorMessage)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      await loginWithGoogle()
      // OAuth will redirect the user
    } catch (err) {
      // Error is handled by the loginWithGoogle function
    }
  }

  const handleFacebookSignUp = async () => {
    try {
      await loginWithFacebook()
    } catch (err) {
      // Error is handled by the loginWithFacebook function
    }
  }

  return (
    <div className="flex min-h-[82.7vh] bg-gradient-to-b from-primary/20 to-primary/10 items-center justify-center px-4 py-12">
      <Helmet>
        <title>{t('meta:titles.login')}</title>
        <meta name="description" content={t('meta:descriptions.login')} />
        <meta property="og:title" content={t('meta:titles.login')} />
        <meta property="og:description" content={t('meta:descriptions.login')} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full max-w-md">
        <Card className="border-primary/20 bg-secondary/70 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-bubbly text-2xl">
              {t('auth:register.title')}
            </CardTitle>
            <CardDescription>
              {currentStep === 1
                ? t('auth:register.step1Description')
                : t('auth:register.step2Description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {currentStep === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('auth:register.nameLabel')}</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder={t('auth:register.namePlaceholder')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth:common.emailLabel')}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('auth:common.emailPlaceholder')}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth:common.passwordLabel')}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={t('auth:common.passwordPlaceholder')}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('auth:register.passwordHint')}
                    </p>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button
                    type="button"
                    className="h-11 w-full rounded-xl"
                    onClick={handleNextStep}
                  >
                    {t('auth:register.nextButton')}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-primary/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-secondary/70 px-2 text-muted-foreground">
                        {t('auth:common.orContinueWith')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleSignUp}
                      disabled={isLoading}
                      className="h-11 w-full justify-center gap-3 rounded-xl border-2 bg-white text-base font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:shadow-md"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleIcon />}
                      <span>{t('auth:common.continueWithGoogle')}</span>
                    </Button>
                    <Button
                      type="button"
                      onClick={handleFacebookSignUp}
                      disabled={isLoading}
                      className="h-11 w-full justify-center gap-3 rounded-xl bg-[#1877F2] text-base font-medium text-white shadow-sm transition-all duration-200 hover:bg-[#166fe0] hover:shadow-md"
                    >
                      {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FacebookIcon />}
                      <span>{t('auth:common.continueWithFacebook')}</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="childName">{t('auth:register.childNameLabel')}</Label>
                    <Input
                      id="childName"
                      value={childName}
                      onChange={e => setChildName(e.target.value)}
                      placeholder={t('auth:register.childNamePlaceholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="childAge">{t('auth:register.childAgeLabel')}</Label>
                    <Input
                      id="childAge"
                      type="number"
                      min="1"
                      max="12"
                      value={childAge}
                      onChange={e => setChildAge(e.target.value)}
                      placeholder={t('auth:register.childAgePlaceholder')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">{t('auth:register.languageLabel')}</Label>
                    <Select
                      value={language}
                      onValueChange={value =>
                        setLanguage(value as 'en' | 'ar-eg' | 'ar-fos7a' | 'fr')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('auth:register.languagePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('auth:register.languages.en')}</SelectItem>
                        <SelectItem value="ar-eg">{t('auth:register.languages.ar-eg')}</SelectItem>
                        <SelectItem value="ar-fos7a">{t('auth:register.languages.ar-fos7a')}</SelectItem>
                        <SelectItem value="fr">{t('auth:register.languages.fr')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCurrentStep(1)}
                      disabled={isLoading}
                    >
                      {t('auth:register.backButton')}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 rounded-xl bg-[#F97316] px-8 text-white shadow-lg shadow-[#F97316]/30 transition-all duration-200 hover:bg-[#ea6a0c] hover:shadow-xl hover:shadow-[#F97316]/40"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('auth:register.creating')}
                        </>
                      ) : (
                        t('auth:register.createButton')
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              {t('auth:register.haveAccount')}{' '}
              <Link
                to="/login"
                className="text-primary-foreground hover:underline"
              >
                {t('auth:register.signInLink')}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Register
