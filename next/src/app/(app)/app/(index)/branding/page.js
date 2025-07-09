import BIcon from "@/components/BIcon";
import GenericPage from "@/components/dashboard/GenericPage";
import EmptySpace from "@/components/elements/EmptySpace";

export default function () {
  return (
    <GenericPage title={"Branding"}>
      <div className="flex flex-col items-center justify-center min-h-[400px] border-dashed border-2 rounded-2xl">
        <span className="text-2xl font-semibold mb-2">
          Custom Branding
        </span>
        <span className="text-lg text-gray-500 mb-6">
          Personalize your download pages and connect your own domain.
        </span>
        <div className="flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-md">
          <BIcon name={"gear-fill"} className={"animate-spin"}/>
          <span className="text-sm font-medium">
            Feature in development
          </span>
        </div>
      </div>
    </GenericPage>
  )
}