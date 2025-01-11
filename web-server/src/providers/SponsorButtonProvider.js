// https://stackoverflow.com/questions/75652431/how-should-the-createbrowserrouter-and-routerprovider-be-use-with-application-co

import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export const SponsorButtonRoute = () => {

    useEffect(() => {
        var script = document.createElement('script');
        script.src = 'https://sponsorapp.io/platform.js?p=d529defbb252793d';
        document.head.appendChild(script);

        return () => {
            window.unloadSponsorApp()
            script.remove()
        }
    }, [])

    return (
        <Outlet />
    )
}