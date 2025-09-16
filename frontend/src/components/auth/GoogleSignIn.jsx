import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import googleAuthService from '../../services/google-auth-service.js';
import authUtils from '../../utils/auth.js';

function GoogleSignIn({ onError, onLoading }) {
    const navigate = useNavigate();

    useEffect(() => {
        //Load Google Identity Services script
        if (!window.google) {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onLoad = initializeGoogleSignIn;
            document.head.appendChild(script);
        } else {
            initializeGoogleSignIn();
        }

        return () => {
            // Cleanup
            const existingButton = document.getElementById('google-signin-button');
            if (existingButton) {
                existingButton.innerHTML = '';
            }
        };
    }, []);

    function initializeGoogleSignIn() {
        if (window.google && window.google.accounts) {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: false,
                cancel_on_tap_outside: true
            });

            window.google.accounts.id.renderButton(
                document.getElementById('google-signin-button'),
                {
                    theme: 'outline',
                    size: 'large',
                    text: 'continue_with',
                    width: '100%',
                    logo_alignment: 'left'
                }
            );
        }
    }

    async function handleCredentialResponse(response) {
        try {
            onLoading(true);
            onError('');

            const result = await googleAuthService.authenticateWithGoogle(response.credential);
            const { token, user } = result.data;

            //Store authentication data
            authUtils.login(token, user);

            //Redirect to dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Google authentication error:', error);
            onError(error.response?.data?.error || 'Google authentication failed');
        } finally {
            onLoading(false);
        }
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-center mb-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm font-medium">or continue with</span>
                <div className="flex-1 border-t border-gray-300"></div>
            </div>
            <div 
                id="google-signin-button" 
                className="w-full flex justify-center"
            ></div>
        </div>
    );
}

export default GoogleSignIn;