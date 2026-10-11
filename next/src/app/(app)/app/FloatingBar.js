"use client";
import { useLanguage } from "@/context/LanguageContext"

import Link from "next/link";
import { classNames } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  ActivityIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CreditCardIcon,
  LayoutDashboardIcon,
  MailIcon,
  PaintbrushIcon,
  SendIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import logo from "@/img/icon.png";

export default function FloatingBar({ user }) {
  const { language, t } = useLanguage()
  const prepend = "/app";
  const pathname = usePathname();
  const inAdmin = pathname.startsWith("/app/admin");

  const canSeeAdmin = user?.hasTeam && (user?.role === "owner" || user?.role === "admin");
  // Team users manage branding inside the admin panel, not the dashboard.
  const showBrandingInDashboard = !user?.hasTeam;

  const navigation = [
    { id: "Sent", name: t("Sent"), href: "/sent" },
    { id: "Received", name: t("Received"), href: "/received" },
    { id: "Requests", name: t("Requests"), href: "/requests" },
    ...(showBrandingInDashboard ? [{ id: "Branding", name: t("Branding"), href: "/branding" }] : []),
    { id: "Account", name: t("Account"), href: "/settings" },
    ...(canSeeAdmin ? [{ id: "Admin", name: t("Admin"), href: "/admin" }] : []),
    { id: "Transfer", name: t("Transfer"), href: "" },
  ].map((item) => ({ ...item, href: prepend + item.href }));

  const icons = {
    Transfer: SendIcon,
    Account: UserIcon,
    Sent: ArrowUpIcon,
    Received: ArrowDownIcon,
    Requests: MailIcon,
    Branding: PaintbrushIcon,
  };

  const linkIsActive = (href) =>
    href.split("/").length > 2 ? pathname.startsWith(href) : pathname === href;

  // In admin mode the bar becomes the section nav for the panel.
  if (inAdmin) {
    const adminNav = [
      { name: t("Overview"), href: "/app/admin", icon: LayoutDashboardIcon },
      { name: t("Members"), href: "/app/admin/members", icon: UsersIcon },
      { name: t("Transfers"), href: "/app/admin/transfers", icon: ArrowUpIcon },
      { id: "Requests", name: t("Requests"), href: "/app/admin/requests", icon: MailIcon },
      { id: "Branding", name: t("Branding"), href: "/app/admin/branding", icon: PaintbrushIcon },
      { name: t("Activity"), href: "/app/admin/activity", icon: ActivityIcon },
      ...(user?.role === "owner"
        ? [{ name: t("Billing"), href: "/app/admin/billing", icon: CreditCardIcon }]
        : []),
    ];

    const adminActive = (href) =>
      href === "/app/admin" ? pathname === "/app/admin" : pathname.startsWith(href);

    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 fade-in-up">
        <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-900 rounded-full px-2 sm:px-3 py-2 shadow-2xl">
          <Link
            href="/app/sent"
            className="flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ArrowLeftIcon size={16} />
            <span className="hidden sm:inline">{t("Back")}</span>
          </Link>

          {adminNav.map((item) => {
            const Icon = item.icon;
            const active = adminActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={classNames(
                  active
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white",
                  "flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-sm font-medium transition-colors"
                )}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 fade-in-up">
      <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-900 rounded-full px-2 sm:px-3 py-2 shadow-2xl">
        {/* Logo */}
        <Link href={language === "sv" ? "/sv" : "/"} className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 mr-1 sm:mr-2">
          <Image alt="logo" src={logo} className="w-6 h-6 sm:w-8 sm:h-8" />
        </Link>

        {/* Transfer Button (highlighted) */}
        <Link
          href={navigation[navigation.length - 1].href}
          className={classNames(
            linkIsActive(navigation[navigation.length - 1].href)
              ? "bg-primary text-white"
              : "bg-primary-500 text-white hover:bg-primary",
            "flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-sm font-medium transition-colors ml-2"
          )}
        >
          <SendIcon size={16} />
          <span className="hidden sm:inline">{t("Transfer")}</span>
        </Link>

        {/* Navigation Items */}
        {navigation.slice(0, -1).map((item) => {
          const Icon = icons[item.id];
          const active = linkIsActive(item.href);
          const isAdmin = item.id === "Admin";

          return (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                active
                  ? "bg-gray-700 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
                "flex items-center gap-2 rounded-full px-3 sm:px-4 py-2 text-sm font-medium transition-colors"
              )}
            >
              {Icon && <Icon size={16} />}
              <span className="hidden sm:inline">{item.name}</span>
              {isAdmin && <ArrowRightIcon size={14} className="hidden sm:inline" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
