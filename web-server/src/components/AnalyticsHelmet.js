import { Helmet } from "react-helmet";
import { Outlet } from "react-router-dom";

export default function AnalyticsHelmet({ }) {
    return (
        <>
            {process.env.REACT_APP_ANALYTICS && (
                <Helmet>
                    <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.REACT_APP_ANALYTICS}`}></script>
                    <script>
                        {`

                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());

                        gtag('config', '${process.env.REACT_APP_ANALYTICS}');
                        
                        `}
                    </script>
                </Helmet>
            )}
            <Outlet />
        </>
    )
}