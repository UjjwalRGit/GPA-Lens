import api from '../api/api.js';

function authenticateWithGoogle(credential) {
    return api.post('/auth/google', { credential });
}

export const googleAuthService = {
    authenticateWithGoogle
};

export default googleAuthService;