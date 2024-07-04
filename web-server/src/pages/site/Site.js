import { Outlet, ScrollRestoration } from "react-router-dom";
import MaxWidthContainer from "../../components/MaxWidthContainer";
import SiteHeader from "../../components/site/SiteHeader";
import SiteFooter from "../../components/site/SiteFooter";

export default function Site() {
  return (
    <div className="Site bg-body text-body" data-bs-theme="light">
      <ScrollRestoration/>
      <SiteHeader />
      <Outlet />
      <MaxWidthContainer>
        <SiteFooter />
      </MaxWidthContainer>
    </div>
  )
}