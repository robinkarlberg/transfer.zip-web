import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function ({ children }) {
  return (
    <div>
      <Header scrollAware />
      {children}
      <Footer />
    </div>
  )
}