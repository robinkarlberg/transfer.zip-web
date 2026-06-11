import Link from "next/link";
import GenericPage from "@/components/dashboard/GenericPage";
import EmptySpace from "@/components/elements/EmptySpace";
import { Button } from "@/components/ui/button";
import { FEATURE } from "@/lib/pricing";
import { listBrandProfilesForUser, canManageBrandProfiles } from "@/lib/server/mongoose/helpers/brandProfiles";
import { listCustomDomainsForUser, canManageCustomDomains } from "@/lib/server/mongoose/helpers/customDomains";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import BrandProfilesSection from "./BrandProfilesSection";
import CustomDomainSection from "./CustomDomainSection";

export default async function BrandingPage() {
  const { user } = await useServerAuth();

  const [profiles, customDomains] = await Promise.all([
    listBrandProfilesForUser(user).then(rows => rows.map(p => p.toJsonAsClient())),
    listCustomDomainsForUser(user).then(rows => rows.map(d => d.toJsonAsClient())),
  ]);

  const isTeam = user.hasTeam;
  const basePath = isTeam ? "/app/admin/branding" : "/app/branding";

  const hasFeature = user.hasFeature(FEATURE.CUSTOM_BRANDING);
  const canManage = canManageBrandProfiles(user);
  const canManageDomains = canManageCustomDomains(user);

  return (
    <GenericPage title="Branding">
      {
        hasFeature ? (
          <div className="space-y-4">
            <BrandProfilesSection
              profiles={profiles}
              basePath={basePath}
              canManage={canManage}
            />

            <CustomDomainSection
              domains={customDomains}
              canManage={canManageDomains}
            />
          </div>
        ) : (
          <EmptySpace
            title="Brand your transfers"
            subtitle="Add your own logo, customize backgrounds, and show your branding in emails and on download pages."
          >
            {!isTeam && (
              <Button asChild>
                <Link className="mt-4" href="/pricing">Upgrade to Pro &rarr;</Link>
              </Button>
            )}
          </EmptySpace>
        )
      }

    </GenericPage>
  );
}
