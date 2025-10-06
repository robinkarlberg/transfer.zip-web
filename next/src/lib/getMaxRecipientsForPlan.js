export const getMaxRecipientsForPlan = (plan) => {
  if (plan == "pro") return 30;
  else if (plan == "starter") return 10;
  else return 10;
};

export const EMAILS_PER_DAY_LIMIT = 50