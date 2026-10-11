
import { getTranslations } from "@/lib/server/language"
import { listBrandProfilesForUser } from "@/lib/server/mongoose/helpers/brandProfiles";
import { useServerAuth } from "@/lib/server/wrappers/auth";

import NewTransferFileUploadNew from "@/components/newtransfer/NewTransferFileUploadNew";

export default async function () {
  const t = await getTranslations()
  const { user } = await useServerAuth()
  const storage = await user.getStorage()
  const brandProfiles = await listBrandProfilesForUser(user)
  return (
    <div className="mb-16">
      <div className="mx-auto max-w-xl mb-4 sm:mb-16 px-4 fade-in-up-fast">
        <h1 className="mx-auto text-center max-w-2xl text-4xl font-bold tracking-tight text-white mb-20">{t("Let's")}{" "}
          <span className="relative">
            <span className="relative z-10">{t("send")}</span>
            <svg
              className="absolute left-0 bottom-[0.08em] w-full text-primary-100"
              style={{ height: "0.15em" }}
              viewBox="0 0 100 20"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 15 C 20 22, 40 5, 60 12 S 90 18, 98 10"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ vectorEffect: "non-scaling-stroke" }}
              />
            </svg>
          </span>
          {" "}{t("some files.")}</h1>
      </div>
      <div className="flex fade-in-up-slow">
        <NewTransferFileUploadNew isDashboard={true} loaded={true} user={user.toJsonAsClient()} storage={storage} brandProfiles={brandProfiles.map(x => x.toJsonAsClient())} />
      </div>
    </div>
  )
}