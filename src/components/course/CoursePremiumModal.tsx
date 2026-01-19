import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Crown, Star } from "lucide-react";

interface CoursePremiumModalProps {
  onSubscriptionClick: () => void;
  courseTitle?: string;
}

export const CoursePremiumModal = ({ onSubscriptionClick, courseTitle }: CoursePremiumModalProps) => {
  const { t } = useTranslation('courses');

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full"></div>
          <Crown className="w-16 h-16 text-primary relative" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bubbly text-primary-foreground">
          {t('premium.modal.title')}
        </h2>
        <p className="text-primary-foreground/80">
          {courseTitle && `"${courseTitle}" - `}{t('premium.modal.description')}
        </p>
      </div>

      <div className="bg-primary/10 rounded-lg p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary-foreground/90">
            {t('premium.modal.benefit1')}
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary-foreground/90">
            {t('premium.modal.benefit2')}
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary-foreground/90">
            {t('premium.modal.benefit3')}
          </p>
        </div>
      </div>

      <Button 
        onClick={onSubscriptionClick}
        variant="default"
        className="w-full"
      >
        <Crown className="w-4 h-4 mr-2" />
        {t('premium.modal.subscribeButton')}
      </Button>
    </div>
  );
};
