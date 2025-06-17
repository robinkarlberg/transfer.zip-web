export default function Main({ children, size }) {
  const _size = size || "max-w-7xl"
  return (
    <div className="grow flex bg-white">
      <main className={`w-full py-10 lg:pl-64 mx-auto ${_size}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}