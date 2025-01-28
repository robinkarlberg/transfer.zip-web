import BIcon from "../../components/BIcon";
import GenericPage from "../../components/dashboard/GenericPage";
import TransferList from "../../components/dashboard/TransferList";

export default function TransfersPage({ }) {

  const transfers = [
    { title: "Test" }
  ]

  return (
    <GenericPage title={"Transfers"}>
      <div className="flex gap-2">
        <button className="bg-primary text-white text-sm rounded-lg py-1.5 px-3 shadow hover:bg-primary-light"><BIcon name={"send-fill"} className={"me-2"}/>New Transfer</button>
        {/* <button className="bg-gray-500 text-white text-sm rounded-lg py-1.5 px-3 shadow hover:bg-gray-400">New Transfer</button> */}
      </div>
      <TransferList transfers={transfers} />
    </GenericPage>
  )
}