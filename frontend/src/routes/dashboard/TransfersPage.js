import { Link, Outlet, useLoaderData, useRouteLoaderData } from "react-router-dom";
import BIcon from "../../components/BIcon";
import GenericPage from "../../components/dashboard/GenericPage";
import TransferList from "../../components/dashboard/TransferList";
import { getTransferList } from "../../Api";

export default function TransfersPage({ }) {

  const { transfers } = useRouteLoaderData("dashboard")

  return (
    <GenericPage title={"Transfers"}>
      <div className="flex gap-2 mb-3">
        <Link to="new" className="bg-primary text-white text-sm rounded-lg py-1.5 px-3 shadow hover:bg-primary-light"><BIcon name={"plus-lg"} className={"me-2"} />New Transfer</Link>
        {/* <button className="bg-gray-500 text-white text-sm rounded-lg py-1.5 px-3 shadow hover:bg-gray-400">New Transfer</button> */}
      </div>
      <TransferList transfers={transfers} />
      <Outlet/>
    </GenericPage>
  )
}