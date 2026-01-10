
export default function ({ title, children }) {
  return (
    <div className="px-4 sm:px-6 lg:px-10">
      <div className="mb-24 sm:mb-26 mt-8 sm:mt-16 w-full mx-auto max-w-3xl">
        {children}
      </div>
    </div>
  )
}