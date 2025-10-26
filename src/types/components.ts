import { ReactNode } from 'react';

export interface AdminRouteProps {
  children: ReactNode;
}

export interface HLSVideoPlayerProps {
  src: string;
  onEnded?: () => void;
  autoPlay?: boolean;
  controls?: boolean;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface HomePageSettings {
  showPricingPopup: boolean;
}

export type ToasterToast = {
  id: string;
  title?: string;
  description?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
  onDismiss?: () => void;
}

export type Toast = Omit<ToasterToast, "id">;