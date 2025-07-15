import QuickShareNew from "./QuickShareNew"

export default async function () {
  const res = await fetch("https://api.github.com/repos/robinkarlberg/transfer.zip-web",
    {
      next: { revalidate: 3600 }
    }
  )
  const json = await res.json()

  return <QuickShareNew stars={json.stargazers_count}/>
}