import { useEffect } from "react"

export default function Adsense({ data_ad_client, data_ad_slot, className }) {
    useEffect(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
    }, [])

    return (
        <div>
            <script async src={"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + data_ad_client}
                crossOrigin="anonymous"></script>
            <ins className={"adsbygoogle " + className}
                style={{ display: "block", backgroundColor: "white" }}
                data-ad-client={data_ad_client}
                data-ad-slot={data_ad_slot}
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
        </div>
    )
}