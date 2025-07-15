export default function Main({ children, size }) {
  const _size = size || "max-w-6xl"
  return (
    <div className="grow flex bg-white">
      <div className={`w-full py-10 lg:pl-64`}>
        <main className={`px-4 sm:px-6 lg:px-10 mx-auto w-full ${_size}`}>
          {children}
        </main>
      </div>
    </div>
  )
}