import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const Register = () => {
  const navigate = useNavigate()
  const {
    register: signUp,
    loginWithGoogle,
    loginWithApple,
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
    // Redirect to home if already authenticated
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleNextStep = () => {
    if (!name || !email || !password) {
      setError('Please fill all required fields')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setError('')
    setCurrentStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signUp(email, password, name, childName || undefined, language)
      // Redirect will happen through the useEffect if authentication is successful
      // Otherwise, user will stay on the page to verify their email
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
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

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-primary/20 bg-secondary/70 backdrop-blur-sm ">
          <CardHeader className="text-center">
            <CardTitle className="font-bubbly text-2xl">
              Create an Account
            </CardTitle>
            <CardDescription>
              {currentStep === 1
                ? 'Join us for magical bedtime stories'
                : 'Tell us about your little one'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {currentStep === 1 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="John Smith"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="hello@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}

                  <Button
                    type="button"
                    className="bg-primary-foreground w-full hover:bg-primary"
                    onClick={handleNextStep}
                  >
                    Next
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-secondary px-2 text-muted-foreground ">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleGoogleSignUp}
                      disabled={isLoading}
                    >
                      Google
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={handleAppleSignUp}
                      disabled={isLoading}
                    >
                      Apple
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="childName">Child's Name (Optional)</Label>
                    <Input
                      id="childName"
                      value={childName}
                      onChange={e => setChildName(e.target.value)}
                      placeholder="Adam"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="childAge">Child's Age (Optional)</Label>
                    <Input
                      id="childAge"
                      type="number"
                      min="1"
                      max="12"
                      value={childAge}
                      onChange={e => setChildAge(e.target.value)}
                      placeholder="6"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select
                      value={language}
                      onValueChange={value =>
                        setLanguage(value as 'en' | 'ar-eg' | 'ar-fos7a' | 'fr')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar-eg">مصري</SelectItem>
                        <SelectItem value="ar-fos7a">فصحى</SelectItem>
                        <SelectItem value="fr">français</SelectItem>
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
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-primary-foreground flex-1 hover:bg-primary"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-foreground hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Register
