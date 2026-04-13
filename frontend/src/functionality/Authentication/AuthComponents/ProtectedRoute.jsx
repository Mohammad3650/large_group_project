import { Navigate } from 'react-router-dom';
import RouteLoadingScreen from '../../../components/RouteLoadingScreen';
import useProtectedRouteAccess from '../utils/Hooks/useProtectedRouteAccess';

/**
 * Restricts access to authenticated users only.
 *
 * While authentication is being checked, a loading screen is shown.
 * Unauthenticated users are redirected to the login page.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected content to render.
 * @returns {JSX.Element}
 */
function ProtectedRoute({ children }) {
    const isAllowed = useProtectedRouteAccess();

    if (isAllowed === null) {
        return <RouteLoadingScreen message="Checking authentication..." />;
    }

    if (!isAllowed) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;