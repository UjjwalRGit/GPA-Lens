import api from '../api/api.js';

function getEvents() {
    return api.get('/calendar');
}

function getMonthlyEvents(year, month) {
    return api.get(`/calendar/${year}/${month}`);
}

function getUpcomingEvents(limit = 10) {
    return api.get(`/calendar/upcoming?limit=${limit}`);
}

function createEvent(eventData) {
    return api.post('/calendar', eventData);
}

function updateEvent(id, eventData) {
    return api.put(`/calendar/${id}`, eventData);
}

function deleteEvent(id) {
    return api.delete(`/calendar/${id}`);
}

function toggleEventCompletion(id) {
    return api.patch(`/calendar/${id}/complete`);
}

export const calendarService = {
    getEvents,
    getMonthlyEvents,
    getUpcomingEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventCompletion
};

export default calendarService;