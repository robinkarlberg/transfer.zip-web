import { Outlet } from "react-router-dom";
import AppGenericPage from "../../../../components/app/AppGenericPage";

export default function UnzipFilesAppPage({ }) {

    return (
        <AppGenericPage title={"View Zip"} className={"ZipFileOnlinePage d-flex flex-column px-0"}>
            <Outlet />
        </AppGenericPage>
    )
}