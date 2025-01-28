import { Outlet } from "react-router-dom";
import FileUpload from "../components/elements/FileUpload";

export default function QuickSharePage({ }) {
  return (
    <main className="grid min-h-[100vh] place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Quick Share</h1>
        <Outlet/>
      </div>
    </main>
  )
}