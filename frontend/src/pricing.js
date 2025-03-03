export default {
  tiers: [
    {
      name: "Starter",
      price: "$9",
      description: "For personal use and quick file sharing.",
      features: [
        "Quick-Share files of any size",
        "Unlimited transfers",
        "Up to 200GB per transfer",
        "Files expire after 14 days"
      ],
    },
    {
      name: "Pro",
      price: "$19",
      description: "For power users & professionals.",
      features: [
        "Quick-Share files of any size",
        "Unlimited transfers",
        "Up to 1TB per transfer",
        "Files stay up for 365 days",
        "Eearly access to new features",
        "Priority support",
        // "Password protect files",
      ],
      featured: true,
    }
  ]
}