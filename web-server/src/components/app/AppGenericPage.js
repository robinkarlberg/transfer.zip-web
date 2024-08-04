import { useContext } from "react";
import { Helmet } from "react-helmet";
import { AuthContext } from "../../providers/AuthProvider";
import { Navigate } from "react-router-dom";

export default function AppGenericPage({ className, title, titleElement, requireAuth, requirePlan, children, flex }) {
    const { user, isFreeUser, isGuestUser } = useContext(AuthContext)

    if (requireAuth) {
        if (user && isGuestUser()) {
            return <Navigate to={"/login"} replace={true} />
        }
    }

    if (requirePlan) {
        if (!user || isFreeUser()) {
            return <Navigate to={"/app"} replace={true} />
        }
    }

    return (
        <div className={"text-body px-4 w-100  " + className}>
            <div>
                {title && (
                    <Helmet>
                        <title>{title} | Transfer.zip - Send large files with no signup, no size limit, for free</title>
                    </Helmet>
                )}
                <div className="mx-0 m-4" style={{ height: "29.5px" }}>
                    {titleElement || <h4 >{title}</h4>}
                </div>
                <hr></hr>
            </div>
            {children}
        </div>
    )
}