export default function TransferList({ transfers }) {

  const Entry = ({ transfer }) => {
    return (
      <div className="rounded-lg bg-white p-4 group">
        <h3 className="text-xl font-bold">{transfer.title}</h3>
        
      </div>
    )
  }

  return (
    <div className="">
      {transfers.map((transfer, index) => <Entry transfer={transfer} />)}
    </div>
  )
}