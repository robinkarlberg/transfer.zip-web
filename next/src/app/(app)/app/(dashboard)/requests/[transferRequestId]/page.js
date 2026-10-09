import { notFound, redirect } from "next/navigation"
import mongoose from "mongoose"
import TransferRequestPage from "@/components/dashboard/TransferRequestPage"
import Transfer from "@/lib/server/mongoose/models/Transfer"
import TransferRequest from "@/lib/server/mongoose/models/TransferRequest"
import { listRequestSubmissions } from "@/lib/server/mongoose/helpers/transferRequests"
import { listBrandProfilesForUser } from "@/lib/server/mongoose/helpers/brandProfiles"
import { useServerAuth } from "@/lib/server/wrappers/auth"

export default async function RequestPage({ params, searchParams }) {
  const auth = await useServerAuth()
  if (!auth) redirect("/signin")
  const { transferRequestId } = await params
  const { submission: selectedId } = await searchParams
  if (!mongoose.isObjectIdOrHexString(transferRequestId)) notFound()
  const request = await TransferRequest.findOne({ _id: transferRequestId, author: auth.user._id })
  if (!request) notFound()

  const query = { transferRequest: request._id, finishedUploading: true }
  const [page, total, unreviewed, selected, serializedRequest, brandProfiles] = await Promise.all([
    listRequestSubmissions(request),
    Transfer.countDocuments(query),
    Transfer.countDocuments({ ...query, reviewedAt: null }),
    mongoose.isObjectIdOrHexString(selectedId)
      ? Transfer.findOne({ ...query, _id: selectedId })
      : null,
    request.toJsonAsOwner(),
    listBrandProfilesForUser(auth.user),
  ])
  if (selected && !page.submissions.some(submission => submission.id === selectedId)) {
    page.submissions.push(selected.toJsonAsRequestOwner())
  }

  return <TransferRequestPage
    key={transferRequestId}
    transferRequest={serializedRequest}
    brandProfiles={brandProfiles.map(profile => profile.toJsonAsClient())}
    initialData={{ ...page, total, unreviewed }}
    selectedId={selected ? selectedId : null}
    missingSubmission={!!selectedId && !selected}
  />
}
