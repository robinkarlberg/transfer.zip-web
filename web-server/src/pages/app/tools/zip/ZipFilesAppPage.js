import { Outlet } from "react-router-dom";
import AppGenericPage from "../../../../components/app/AppGenericPage";

export default function ZipFilesAppPage({ }) {

    return (
        <AppGenericPage title={"Create Zip"} className={"ZipFileOnlinePage d-flex flex-column px-0"}>
            <div className="w-100 d-flex flex-column flex-grow-1 justify-content-center align-items-center p-3 px-0 position-relative">
                <Outlet />
            </div>
        </AppGenericPage>
    )
}