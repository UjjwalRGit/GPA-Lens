import api from '../api/api.js';

function getPreferences() {
    return api.get('/user/email-preferences');
}

function updatePreferences(preferences) {
    return api.put('/user/email-preferences', preferences);
}

function testReminder(eventId) {
    return api.post(`/test-reminder/${eventId}`);
}

export const reminderService = {
    getPreferences,
    updatePreferences,
    testReminder
};

export default reminderService;