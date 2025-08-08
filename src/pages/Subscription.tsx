
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type PlanType = 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

const Subscription = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation(['subscription', 'misc']);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('quarterly');
  const [isGift, setIsGift] = useState(false);
  
  useEffect(() => {
    document.title = `${t('misc:layout.appName')} - ${t('title')}`;
  }, [t]);
  
  const planIds: PlanType[] = ['monthly', 'quarterly', 'yearly', 'lifetime'];
  
  const getPlanPrice = (planId: PlanType) => {
    const prices = { monthly: 4.99, quarterly: 11.99, yearly: 39.99, lifetime: 149.99 };
    return prices[planId];
  };
  
  const handleSubscribe = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    
    setTimeout(() => {
      toast.success(t('misc:button.subscribeNow'));
    }, 1500);
  };
  
  return (
    <div className="py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bubbly mb-4">{t('title')}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
        
        <Tabs 
          defaultValue={selectedPlan}
          value={selectedPlan}
          onValueChange={(value) => setSelectedPlan(value as PlanType)}
          className="mb-8"
        >
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            {planIds.map((planId) => (
              <TabsTrigger key={planId} value={planId}>
                {t(`plans.${planId}.name`)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {planIds.map((planId) => (
            <TabsContent key={planId} value={planId}>
              <Card className={cn(
                "mx-auto overflow-hidden border-2",
                planId === 'quarterly' ? "border-dream-DEFAULT" : "border-border"
              )}>
                <CardHeader className={cn(
                  planId === 'quarterly' ? "bg-dream-DEFAULT/10" : ""
                )}>
                  {planId === 'quarterly' && (
                    <div className="mb-2">
                      <span className="bg-dream-DEFAULT text-white text-xs py-1 px-3 rounded-full uppercase font-bold">
                        {t('mostPopular')}
                      </span>
                    </div>
                  )}
                  <CardTitle className="text-2xl">{t(`plans.${planId}.name`)}</CardTitle>
                  <div>
                    <span className="text-3xl font-bold">${getPlanPrice(planId)}</span>
                    {planId !== 'lifetime' && <span className="text-muted-foreground">/{planId}</span>}
                  </div>
                  <CardDescription>{t(`plans.${planId}.description`)}</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    {t(`plans.${planId}.features`, { returnObjects: true }).map((feature: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-dream-DEFAULT mr-2 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {planId === 'yearly' && (
                    <div className="mt-6 bg-secondary/50 p-4 rounded-lg">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isGift && selectedPlan === planId}
                          onChange={() => setIsGift(!isGift)}
                          className="mr-2"
                        />
                        {t('sendAsGift')}
                      </label>
                      <p className="text-sm text-muted-foreground ml-6 mt-1">
                        {t('giftDescription')}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className={cn(
                      "w-full",
                      planId === 'quarterly' ? "bg-dream-DEFAULT hover:bg-dream-dark" : ""
                    )}
                    onClick={handleSubscribe}
                  >
                    {t('subscribeNow')}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
        
        <section className="mt-16">
          <h2 className="text-2xl font-bubbly mb-6">{t('faq.title')}</h2>
          
          <div className="space-y-4">
            <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2">{t('faq.included.question')}</h3>
              <p className="text-muted-foreground">
                {t('faq.included.answer')}
              </p>
            </div>
            
            <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2">{t('faq.cancel.question')}</h3>
              <p className="text-muted-foreground">
                {t('faq.cancel.answer')}
              </p>
            </div>
            
            <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2">{t('faq.gift.question')}</h3>
              <p className="text-muted-foreground">
                {t('faq.gift.answer')}
              </p>
            </div>
            
            <div className="bg-white/70 dark:bg-nightsky-light/70 p-6 rounded-xl backdrop-blur-sm">
              <h3 className="text-lg font-semibold mb-2">{t('faq.lifetime.question')}</h3>
              <p className="text-muted-foreground">
                {t('faq.lifetime.answer')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Subscription;
