import BIcon from "@/components/BIcon"
import GenericPage from "@/components/dashboard/GenericPage"
import Link from "next/link"
import DefaultLayout from "@/components/dashboard/DefaultLayout"

export default async function ({ children }) {
  return (
    <DefaultLayout>
      <GenericPage title={"My Transfers"}>
        <div className="md:hidden flex gap-2 mb-3">
          <Link href="/app/new" className="bg-primary text-white text-sm rounded-lg py-1.5 px-3 shadow hover:bg-primary-light"><BIcon name={"plus-lg"} className={"me-2"} />New Transfer</Link>
        </div>
        {children}
      </GenericPage>
    </DefaultLayout>
  )
}