export default function ({ children }) {
  return (
    <div className="w-full min-h-screen flex flex-col items-stretch sm:bg-gray-50">
      {children}
    </div>
  )
}