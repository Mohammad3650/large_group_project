import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { isTokenValid } from '../utils/Auth/authToken';

/**
 * A route guard component that restricts access to pages to authenticated users only.
 *
 * It checks whether the user's auth token is valid:
 * - If valid -> renders the protected content
 * - If invalid -> redirects to the login page
 * - While checking -> renders a loading spinner
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected content to render if authenticated
 * @returns {JSX.Element|null} The protected content, a redirect or null when loading.
 */

function ProtectedRoute({ children }) {
    const [isAllowed, setIsAllowed] = useState(null);

    useEffect(() => {
        async function checkAccess() {
            const ok = await isTokenValid();
            setIsAllowed(ok);
        }

        checkAccess();
    }, []);

    if (isAllowed === null) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-dark mb-3" role="status" />
                    <p className="text-muted mb-0">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!isAllowed) return <Navigate to="/login" replace />;

    return children;
}

export default ProtectedRoute;
