import GenericPage from "../../components/dashboard/GenericPage";
import TransferList from "../../components/dashboard/TransferList";

export default function TransfersPage({ }) {

  const transfers = [
    { title: "Test" }
  ]

  return (
    <GenericPage title={"Transfers"}>
      <TransferList transfers={transfers} />
    </GenericPage>
  )
}