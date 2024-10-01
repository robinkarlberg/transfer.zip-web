import { Outlet, ScrollRestoration } from "react-router-dom";
import MaxWidthContainer from "../../components/MaxWidthContainer";
import SiteHeader from "../../components/site/SiteHeader";
import SiteFooter from "../../components/site/SiteFooter";

export default function Site() {
  return (
    <div className="Site bg-body text-body" data-bs-theme="light">
      <ScrollRestoration />
      {/* <div className="d-block bg-warning-subtle text-warning-emphasis text-center p-2">
        <span><b>Maintenance:</b> logins and permanent transfers are unavailable from today until 2/10</span>
      </div> */}
      <SiteHeader />
      <Outlet />
      <MaxWidthContainer>
        <SiteFooter />
      </MaxWidthContainer>
    </div>
  )
}