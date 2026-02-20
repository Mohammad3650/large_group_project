import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isTokenValid } from "../utils/authToken";

function ProtectedRoute({ children }) {
    const [allowed, setAllowed] = useState(null);


    useEffect(() => {
        (async () => {
            const ok = await isTokenValid();
            setAllowed(ok);
        })();
    }, []);
       
    if (allowed == null) return null;
    if (!allowed) return <Navigate to="/login" replace />

    return children;
}

export default ProtectedRoute;