"use client";

import Link from "next/link";
import { classNames } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { humanFileSize } from "@/lib/transferUtils";
import { ArrowDownIcon, ArrowUpIcon, BoltIcon, HouseIcon, MailIcon, MailQuestionIcon, PaintbrushIcon, PlusIcon, SendIcon, UserIcon } from "lucide-react";

export default function Sidebar({ user, storage }) {
  const prepend = "/app";
  const pathname = usePathname();

  const navigation = [
    { name: "Transfer", href: "/new" },
    { name: "Account", href: "/settings" },
    { name: "Sent", href: "/sent" },
    { name: "Received", href: "/received" },
    { name: "Requests", href: "/requests" },
    { name: "Branding", href: "/branding" },
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

  const renderNavLink = (item) => {
    const Icon = icons[item.name] || SendIcon;
    const active = linkIsActive(item.href);

    return (
      <li key={item.name}>
        <Link
          href={item.href}
          className={classNames(
            active ? "bg-gray-200 text-gray-800" : "text-gray-800 hover:bg-gray-100",
            "group flex flex-col items-center rounded-md p-2 text-xs font-bold leading-6 transition-colors"
          )}
        >
          <Icon className="mt-1" size={20} />
          <span className="text-center">{item.name}</span>
        </Link>
      </li>
    );
  };

  const renderStorage = () => {
    if (!storage) return null;

    if (user?.plan === "free") {
      return (
        <Link
          href="/onboarding"
          className="block rounded-md border border-purple-200/70 bg-purple-50 px-2 py-2 text-center text-[11px] font-semibold text-purple-700 transition hover:border-purple-200 hover:bg-white"
        >
          Upgrade Plan
        </Link>
      );
    }

    return (
      <div className="rounded-md border border-white/10 bg-white/5 px-2 py-2">
        <div className="text-[11px] font-semibold text-stone-100">{storage.storagePercent}% used</div>
        <div className="text-[10px] text-stone-100">
          {humanFileSize(storage.usedStorageBytes, true)}
        </div>
        <Progress className="mt-2 h-1.5 bg-white/20" value={storage.storagePercent} />
      </div>
    );
  };

  const accountHref = `${prepend}/settings`;
  const accountActive = pathname.startsWith(accountHref);

  return (
    <div className="z-50 w-24 flex flex-col">
      <div className="flex-none px-3 flex items-center justify-center pt-3">
        <ul role="list" className="w-full flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="space-y-2">
              {renderNavLink(navigation[0])}
            </ul>
          </li>
        </ul>
      </div>
      <div className="flex-1 px-3 flex items-center justify-center">
        <ul role="list" className="w-full flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="space-y-2">
              {navigation.slice(2).map(renderNavLink)}
            </ul>
          </li>
        </ul>
      </div>
      {/* <div className="px-3 mb-4">
        {renderStorage()}
      </div> */}
      <div className="flex-none w-full px-3 pb-2">
        <ul role="list" className="w-full flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="space-y-2">
              {renderNavLink(navigation[1])}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}
