
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PlanType = 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

interface Plan {
  id: PlanType;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  giftable?: boolean;
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 4.99,
    description: 'Perfect for trying out our premium features',
    features: [
      'Unlimited access to all stories',
      'Ad-free experience',
      'New stories weekly',
      'Download stories for offline use',
      'Access to all languages'
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 11.99,
    description: 'Save 20% with quarterly billing',
    features: [
      'Unlimited access to all stories',
      'Ad-free experience',
      'New stories weekly',
      'Download stories for offline use', 
      'Access to all languages',
      'Priority access to new features'
    ],
    popular: true
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 39.99,
    description: 'Best value, save over 30%',
    features: [
      'Unlimited access to all stories',
      'Ad-free experience',
      'New stories weekly',
      'Download stories for offline use',
      'Access to all languages',
      'Priority access to new features',
      'Send as a gift option'
    ],
    giftable: true
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 149.99,
    description: 'One-time payment for lifetime access',
    features: [
      'Unlimited access to all stories forever',
      'Ad-free experience',
      'New stories weekly',
      'Download stories for offline use',
      'Access to all languages',
      'Priority access to new features',
      'Special lifetime member badge'
    ]
  }
];

const Subscription = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('quarterly');
  const [isGift, setIsGift] = useState(false);
  
  useEffect(() => {
    document.title = "Bedtime Stories - Subscription Plans";
  }, []);
  
  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    const selectedPlanObj = plans.find(p => p.id === selectedPlan);
    
    // Mock subscription process - in real app, this would connect to payment provider
    setTimeout(() => {
      toast.success(`Subscribed to ${selectedPlanObj?.name} plan!`);
    }, 1500);
  };
  
  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bubbly mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unlock unlimited access to all stories and features with our premium plans.
            Choose the option that works best for you and your family.
          </p>
        </div>
        
        <Tabs 
          defaultValue={selectedPlan}
          value={selectedPlan}
          onValueChange={(value) => setSelectedPlan(value as PlanType)}
          className="mb-8"
        >
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            {plans.map((plan) => (
              <TabsTrigger key={plan.id} value={plan.id}>{plan.name}</TabsTrigger>
            ))}
          </TabsList>
          
          {plans.map((plan) => (
            <TabsContent key={plan.id} value={plan.id}>
              <Card className={cn(
                "mx-auto overflow-hidden border-2",
                plan.popular ? "border-dream-DEFAULT" : "border-border"
              )}>
                <CardHeader className={cn(
                  plan.popular ? "bg-dream-DEFAULT/10" : ""
                )}>
                  {plan.popular && (
                    <div className="mb-2">
                      <span className="bg-dream-DEFAULT text-white text-xs py-1 px-3 rounded-full uppercase font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <CardTitle className="text-2xl">{plan.name} Plan</CardTitle>
                  <div>
                    <span className="text-3xl font-bold">${plan.price}</span>
                    {plan.id !== 'lifetime' && <span className="text-muted-foreground">/{plan.id}</span>}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-dream-DEFAULT mr-2 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.giftable && (
                    <div className="mt-6 bg-secondary/50 p-4 rounded-lg">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isGift && selectedPlan === plan.id}
                          onChange={() => setIsGift(!isGift)}
                          className="mr-2"
                        />
                        Send as a gift
                      </label>
                      <p className="text-sm text-muted-foreground ml-6 mt-1">
                        Add a personalized message and send this subscription as a gift
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className={cn(
                      "w-full",
                      plan.popular ? "bg-dream-DEFAULT hover:bg-dream-dark" : ""
                    )}
                    onClick={handleSubscribe}
                  >
                    Subscribe Now
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bubbly mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2">What's included in the premium subscription?</h3>
              <p className="text-muted-foreground">
                Premium subscribers get unlimited access to our entire library of stories, in all available languages.
                You'll also enjoy ad-free experience, ability to download stories for offline listening, and priority access to new features.
              </p>
            </div>
            
            <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your access will remain until the end of your current billing cycle.
              </p>
            </div>
            
            <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2">How does the "Send as a Gift" feature work?</h3>
              <p className="text-muted-foreground">
                When you select "Send as a Gift," you'll be able to enter the recipient's email address and add a personalized message.
                They'll receive an email with instructions on how to activate their subscription. This option is only available for yearly plans.
              </p>
            </div>
            
            <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2">What happens after my lifetime subscription?</h3>
              <p className="text-muted-foreground">
                The lifetime subscription gives you unlimited access to all current and future content on Bedtime Stories forever,
                with no additional payments required.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Subscription;
