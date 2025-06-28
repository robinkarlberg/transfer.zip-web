import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function ({ children }) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  )
}