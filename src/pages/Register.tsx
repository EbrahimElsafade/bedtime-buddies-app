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
import { registerSchema } from '@/utils/validation'

const Register = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation(['auth', 'meta'])
  const {
    register: signUp,
    loginWithGoogle,
    loginWithApple,
    loginWithLinkedIn,
    loginWithFacebook,
    loginWithTwitter,
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
      const from = (location.state as any)?.from || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleNextStep = () => {
    // Validate step 1 inputs
    const validationResult = registerSchema.pick({
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
    const validationResult = registerSchema.safeParse({
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
    } catch (err: any) {
      setError(err.message || t('auth:register.errors.createFailed'))
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

  const handleAppleSignUp = async () => {
    try {
      await loginWithApple()
      // OAuth will redirect the user
    } catch (err) {
      // Error is handled by the loginWithApple function
    }
  }

  const handleLinkedInSignUp = async () => {
    try {
      await loginWithLinkedIn()
    } catch (err) {
      // Error is handled by the loginWithLinkedIn function
    }
  }

  const handleFacebookSignUp = async () => {
    try {
      await loginWithFacebook()
    } catch (err) {
      // Error is handled by the loginWithFacebook function
    }
  }

  const handleTwitterSignUp = async () => {
    try {
      await loginWithTwitter()
    } catch (err) {
      // Error is handled by the loginWithTwitter function
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
                    className="w-full "
                    onClick={handleNextStep}
                  >
                    {t('auth:register.nextButton')}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-secondary px-2 text-muted-foreground">
                        {t('auth:common.orContinueWith')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleGoogleSignUp}
                      disabled={isLoading}
                    >
                      {t('auth:common.google')}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleAppleSignUp}
                      disabled={isLoading}
                    >
                      {t('auth:common.apple')}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleLinkedInSignUp}
                      disabled={isLoading}
                    >
                      {t('auth:common.linkedin')}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleFacebookSignUp}
                      disabled={isLoading}
                    >
                      {t('auth:common.facebook')}
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleTwitterSignUp}
                      disabled={isLoading}
                      className="col-span-2"
                    >
                      {t('auth:common.twitter')}
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
                      className="flex-1 bg-primary-foreground hover:bg-primary"
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
