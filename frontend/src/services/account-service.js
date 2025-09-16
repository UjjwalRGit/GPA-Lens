import api from '../api/api.js';

function getAccountInfo() {
    return api.get('/user/account-info');
}

function updateUsername(newUsername, confirmPassword) {
    return api.put('/user/username', {
        newUsername,
        confirmPassword
    });
}

function updateEmail(newEmail, confirmPassword) {
    return api.put('/user/email', {
        newEmail,
        confirmPassword
    });
}

function updatePassword(currentPassword, newPassword) {
    return api.put('/user/password', {
        currentPassword,
        newPassword
    });
}

function createPassword(password) {
    return api.post('/user/create-password', {
        password
    });
}

function checkUsernameAvailability(username) {
    return api.get(`/user/check-username/${encodeURIComponent(username)}`);
}

function checkEmailAvailability(email) {
    return api.get(`/user/check-email/${encodeURIComponent(email)}`);
}

function getDeletionInfo() {
    return api.get('/user/account/deletion-info');
}

function deleteAccount(confirmPassword) {
    return api.delete('/user/account', {
        data: {
            confirmPassword
        }
    });
}

export const accountService = {
    getAccountInfo,
    updateUsername,
    updateEmail,
    updatePassword,
    createPassword,
    checkUsernameAvailability,
    checkEmailAvailability,
    getDeletionInfo,
    deleteAccount
};

export default accountService;