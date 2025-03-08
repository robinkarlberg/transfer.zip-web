import { isInEU } from "./utils";

export default {
  tiers: [
    {
      name: "Starter",
      price: "$9",
      priceYearly: "$72",
      priceYearlyMonthly: "$6",
      description: "For personal use and quick file sharing.",
      features: [
        // "Quick-Share files of any size",
        "Unlimited transfers",
        "Up to 200GB per transfer",
        "Files expire after 14 days",
        "Send files by email",
        isInEU() ? "Proudly hosted in the EU 🇪🇺" : "Ultrafast and secure",
      ],
    },
    {
      name: "Pro",
      price: "$19",
      priceYearly: "$144",
      priceYearlyMonthly: "$12",
      description: "For power users & professionals.",
      features: [
        // "Quick-Share files of any size",
        "Unlimited transfers",
        "Up to 1TB per transfer",
        "Files stay up for 365 days",
        "Send files to 200 emails",
        "Priority support",
        isInEU() ? "Proudly hosted in the EU 🇪🇺" : "Ultrafast and secure",
        // "Password protect files",
      ],
      featured: true,
    }
  ]
}