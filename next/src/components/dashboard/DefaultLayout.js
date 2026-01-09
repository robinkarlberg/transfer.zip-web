
export default function ({ children }) {
  return (
    <div className="mt-10 mb-26 flex-1 bg-white mx-auto max-w-4xl rounded-xl w-full py-12">
      <main className={`w-full mx-auto`}>
        <div className="px-4 sm:px-6 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  )
}