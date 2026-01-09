export default function Main({ children }) {
  return (
    <main className={`w-full mx-auto`}>
      <div className="px-4 sm:px-6 lg:px-10">
        {children}
      </div>
    </main>
  )
}