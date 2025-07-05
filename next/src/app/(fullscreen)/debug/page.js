import EmailLayout from "@/lib/server/mail/templates/EmailLayout";
import TransferDownloadedEmail from "@/lib/server/mail/templates/TransferDownloadedEmail";
import TransferRequestReceivedEmail from "@/lib/server/mail/templates/TransferRequestReceivedEmail";
import TransferRequestShareEmail from "@/lib/server/mail/templates/TransferRequestShareEmail";
import TransferShareEmail from "@/lib/server/mail/templates/TransferShareEmail";

export default function () {
  const props = {
    link: "https://transfer.zip/transfer/asdasadsasdas",
    name: "Test Transfer",
    description: "asdmaio adas\noidasioiodaios dioad s"
  }
  return (
    <div className="grid grid-cols-1 space-y-8" style={{ all: "unset" }}>
      <div className="">
        <TransferRequestShareEmail {...props} />
      </div>
      <div className="">
        <TransferDownloadedEmail {...props} />
      </div>
      <div className="">
        <TransferRequestReceivedEmail {...props} />
      </div>
      <div className="">
        <TransferShareEmail {...props} />
      </div>
    </div>
  )
}