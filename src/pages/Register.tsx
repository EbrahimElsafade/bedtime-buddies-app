import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { register: signUp, loginWithGoogle, loginWithApple, isAuthenticated, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [language, setLanguage] = useState<"en" | "ar-eg" | "ar-fos7a">("ar-eg");
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  
  useEffect(() => {
    // Redirect to home if already authenticated
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  const handleNextStep = () => {
    if (!name || !email || !password) {
      setError("Please fill all required fields");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setError("");
    setCurrentStep(2);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await signUp(email, password, name, childName || undefined, language);
      // Redirect will happen through the useEffect if authentication is successful
      // Otherwise, user will stay on the page to verify their email
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await loginWithGoogle();
      // OAuth will redirect the user
    } catch (err) {
      // Error is handled by the loginWithGoogle function
    }
  };

  const handleAppleSignUp = async () => {
    try {
      await loginWithApple();
      // OAuth will redirect the user
    } catch (err) {
      // Error is handled by the loginWithApple function
    }
  };

  return (
    <div className="py-12 px-4 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <Card className="border-dream-light/20 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bubbly">Create an Account</CardTitle>
            <CardDescription>
              {currentStep === 1 
                ? "Join us for magical bedtime stories" 
                : "Tell us about your little one"
              }
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
                      onChange={(e) => setName(e.target.value)}
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
                      onChange={(e) => setEmail(e.target.value)}
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
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters
                    </p>
                  </div>
                  
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                  
                  <Button
                    type="button"
                    className="w-full bg-dream-DEFAULT hover:bg-dream-dark"
                    onClick={handleNextStep}
                  >
                    Next
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white dark:bg-nightsky-light px-2 text-muted-foreground">
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
                      onChange={(e) => setChildName(e.target.value)}
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
                      onChange={(e) => setChildAge(e.target.value)}
                      placeholder="6"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Preferred Language</Label>
                    <Select 
                      value={language} 
                      onValueChange={(value) => setLanguage(value as "en" | "ar-eg" | "ar-fos7a")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar-eg">Arabic (Egyptian)</SelectItem>
                        <SelectItem value="ar-fos7a">Arabic (Fos7a)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {error && (
                    <p className="text-red-500 text-sm">{error}</p>
                  )}
                  
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
                      className="flex-1 bg-dream-DEFAULT hover:bg-dream-dark"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-dream-DEFAULT hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
