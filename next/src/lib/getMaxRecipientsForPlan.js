import { PLANS } from "@/lib/pricing";

export const getMaxRecipientsForPlan = (plan) => {
  if (plan == PLANS.pro.id || plan == PLANS.teams.id) return 30;
  else if (plan == PLANS.starter.id) return 10;
  else return 2;
};

export const EMAILS_PER_DAY_LIMIT = 50