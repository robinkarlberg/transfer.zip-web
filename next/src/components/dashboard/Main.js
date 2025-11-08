export default function Main({ children, size }) {
  const _size = size || "max-w-6xl"
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <main className={`flex-1 w-full py-12 mx-auto ${_size} `}>
        <div className="px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}