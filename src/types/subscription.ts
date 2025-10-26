export type PlanType = 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

export interface SubscriptionPlan {
  type: PlanType;
  price: number;
  features: string[];
  isMostPopular?: boolean;
}