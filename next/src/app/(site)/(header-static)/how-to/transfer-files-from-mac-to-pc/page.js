import TransferPairPage, { transferPairMetadata } from "@/components/seo/TransferPairPage"

const SLUG = "transfer-files-from-mac-to-pc"

export const metadata = transferPairMetadata(SLUG)

export default function Page() {
  return <TransferPairPage slug={SLUG} />
}
