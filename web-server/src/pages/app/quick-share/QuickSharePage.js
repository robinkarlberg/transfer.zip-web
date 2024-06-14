
import { Outlet } from "react-router-dom"
import AppGenericPage from "../../../components/app/AppGenericPage"

export default function QuickSharePage({ }) {
    
    return (
        <AppGenericPage title={"Quick Share"} className={"QuickSharePage"}>
            <Outlet/>
        </AppGenericPage>
    )
}