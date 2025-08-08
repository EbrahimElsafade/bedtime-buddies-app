
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface PremiumMessageProps {
  onSubscriptionClick: () => void;
  onLoginClick: () => void;
  isAuthenticated: boolean;
}

export const PremiumMessage = ({ onSubscriptionClick, onLoginClick, isAuthenticated }: PremiumMessageProps) => {
  const { t } = useTranslation('premium');

  return (
    <Card className="p-8 text-center border-moon-DEFAULT/30 bg-white/70 dark:bg-nightsky-light/70 backdrop-blur-sm">
      <h3 className="text-2xl font-bubbly mb-4 text-moon-dark">{t('message.title')}</h3>
      <p className="mb-6 max-w-md mx-auto">
        {t('message.description')}
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onSubscriptionClick} className="bg-moon-DEFAULT hover:bg-moon-dark">
          {t('message.subscriptionButton')}
        </Button>
        {!isAuthenticated && (
          <Button variant="outline" onClick={onLoginClick}>
            {t('message.loginButton')}
          </Button>
        )}
      </div>
    </Card>
  );
};
