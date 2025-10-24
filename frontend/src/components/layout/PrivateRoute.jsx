import { Navigate } from 'react-router-dom';
import authUtils from '../../utils/auth.js';
import { useGuestMode } from '../../contexts/GuestModeContext.jsx';

function PrivateRoute({children}) {
    const { isGuestMode } = useGuestMode();
    
    // Allow access if either authenticated OR in guest mode
    return (authUtils.isAuthenticated() || isGuestMode) ? children : <Navigate to='/login' />;
}

export default PrivateRoute;