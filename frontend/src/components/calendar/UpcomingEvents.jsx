import { useState } from 'react';
import { calendarService } from '../../services/calendar-service.js';
import DeleteEventPopUp from './DeleteEventPopUp.jsx';

function UpcomingEvents({ events, onEventClick, onEventUpdated, onEventDeleted }) {
    const [deletingEvent, setDeletingEvent] = useState(null);
    const [showDeletePopUp, setShowDeletePopUp] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    async function handleToggleComplete(event) {
        try {
            const response = await calendarService.toggleEventCompletion(event.id);
            onEventUpdated(response.data);
        } catch (error) {
            console.error('Error toggling event completion:', error);
            alert('Failed to update event');
        }
    }

    function handleDeleteClick(event) {
        setEventToDelete(event);
        setShowDeletePopUp(true);
    }

    async function handleDeleteConfirm() {
        if (!eventToDelete) return;

        setShowDeletePopUp(false);
        setDeletingEvent(eventToDelete.id);

        try {
            await calendarService.deleteEvent(eventToDelete.id);
            onEventDeleted(eventToDelete.id);
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        } finally {
            setDeletingEvent(null);
            setEventToDelete(null);
        }
    }

    function handleDeleteCancel() {
        setShowDeletePopUp(false);
        setEventToDelete(null);
    }

    function getDaysUntil(dateString) {
        const eventDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        
        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
        return `${diffDays} days`;
    }

    function getTypeGradient(eventType) {
        const gradients = {
            'exam': 'from-red-500 to-red-600',
            'quiz': 'from-orange-500 to-orange-600', 
            'project': 'from-purple-500 to-purple-600',
            'due_date': 'from-pink-500 to-pink-600',
            'assignment': 'from-blue-500 to-blue-600',
            'other': 'from-green-500 to-green-600'
        };
        return gradients[eventType] || 'from-gray-500 to-gray-600';
    }

    function getTypeIcon(eventType) {
        const icons = {
            'exam': '📝',
            'quiz': '❓',
            'project': '🎯',
            'due_date': '📅',
            'assignment': '📋',
            'other': '📌'
        };
        return icons[eventType] || '📌';
    }

    function getPriorityIcon(priority) {
        const icons = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        };
        return icons[priority] || '🟡';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    function formatTime(timeString) {
        if (!timeString) return '';
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    function getEventReason(event) {
        const daysUntil = getDaysUntil(event.event_date);
        if (daysUntil === 'Today' || daysUntil === 'Tomorrow') return `Due ${daysUntil}`;
        if (event.priority === 'high') return 'High Priority';
        return 'Upcoming';
    }

    // Separate urgent events (today/tomorrow) from regular priority events
    const urgentEvents = events.filter(event => {
        const daysUntil = getDaysUntil(event.event_date);
        return daysUntil === 'Today' || daysUntil === 'Tomorrow';
    });

    const regularPriorityEvents = events.filter(event => {
        const daysUntil = getDaysUntil(event.event_date);
        return !(daysUntil === 'Today' || daysUntil === 'Tomorrow');
    });

    if (events.length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-200/50 p-8 md:p-16 text-center">
                <div className="text-4xl md:text-6xl mb-4 md:mb-6">🎯</div>
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 md:mb-4">
                    No priority events!
                </h3>
                <p className="text-gray-600 text-base md:text-lg">
                    All caught up! No urgent events in the next 10 days.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-8">
            <DeleteEventPopUp
                isOpen={showDeletePopUp}
                event={eventToDelete}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                isLoading={deletingEvent === eventToDelete?.id}
            />

            {/* Urgent Events Section */}
            {urgentEvents.length > 0 && (
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-red-200/50 overflow-hidden">
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 p-4 md:p-8 border-b border-red-200/50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-lg flex-shrink-0">
                                🚨
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                                    Urgent Events ({urgentEvents.length})
                                </h3>
                                <p className="text-red-600/80 text-xs md:text-sm font-medium">
                                    Events due today or tomorrow
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {urgentEvents.map(event => {
                                const typeGradient = getTypeGradient(event.event_type);
                                const daysUntil = getDaysUntil(event.event_date);
                                
                                return (
                                    <div
                                        key={event.id}
                                        className={`bg-gradient-to-br ${typeGradient} rounded-2xl p-4 md:p-6 shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform ring-2 ring-red-300`}
                                    >
                                        {/* Event Header */}
                                        <div className="flex justify-between items-start mb-3 md:mb-4">
                                            <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                                                <span className="text-xl md:text-2xl bg-white/20 backdrop-blur-sm p-2 rounded-xl flex-shrink-0">
                                                    {getTypeIcon(event.event_type)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white text-sm md:text-lg leading-tight drop-shadow-sm break-words">
                                                        {event.event_name}
                                                    </h4>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2">
                                                        <span className="text-xs px-2 md:px-3 py-1 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold capitalize">
                                                            {event.event_type.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-base md:text-lg">{getPriorityIcon(event.priority)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-xs md:text-sm font-bold text-white bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 md:py-2 rounded-xl shadow-sm mb-2">
                                                    {daysUntil}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Event Details */}
                                        <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                                            <div className="text-xs md:text-sm text-white/90 flex items-center gap-2">
                                                <span>📅</span>
                                                <span className="break-all">{formatDate(event.event_date)} {event.event_time && `at ${formatTime(event.event_time)}`}</span>
                                            </div>
                                            {event.class_department && event.class_id && (
                                                <div className="text-xs md:text-sm text-white/90 flex items-center gap-2">
                                                    <span>🎓</span>
                                                    <span className="break-all">{event.class_department} {event.class_id}</span>
                                                </div>
                                            )}
                                            {event.reminder_days > 0 && (
                                                <div className="text-xs md:text-sm text-white/90 flex items-center gap-2">
                                                    <span>🔔</span>
                                                    <span>Reminder: {event.reminder_days} day{event.reminder_days !== 1 ? 's' : ''} before</span>
                                                </div>
                                            )}
                                            <div className="text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 rounded-xl inline-block">
                                                {getEventReason(event)}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => handleToggleComplete(event)}
                                                className="flex-1 px-2 md:px-3 py-2 text-xs md:text-sm bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-300 hover:bg-white/30 hover:-translate-y-0.5 shadow-sm border border-white/20"
                                            >
                                                ✅ Complete
                                            </button>
                                            <button
                                                onClick={() => onEventClick(event)}
                                                className="px-2 md:px-3 py-2 text-xs md:text-sm bg-white/90 backdrop-blur-sm text-gray-700 border border-white/50 rounded-xl font-semibold transition-all duration-300 hover:bg-white hover:border-white shadow-sm"
                                            >
                                                Details
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(event)}
                                                className="px-2 md:px-3 py-2 text-xs md:text-sm bg-red-500/20 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-300 hover:bg-red-500/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-sm border border-red-300/20"
                                                disabled={deletingEvent === event.id}
                                            >
                                                {deletingEvent === event.id ? '⏳' : '🗑️'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Regular Priority Events */}
            {regularPriorityEvents.length > 0 && (
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-200/50 overflow-hidden">
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8 border-b border-purple-200/50">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-lg flex-shrink-0">
                                📋
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    Priority Events ({regularPriorityEvents.length})
                                </h3>
                                <p className="text-purple-600/80 text-xs md:text-sm font-medium">
                                    Events due within 10 days or marked as high priority
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 md:p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                            {regularPriorityEvents.map(event => {
                                const typeGradient = getTypeGradient(event.event_type);
                                const daysUntil = getDaysUntil(event.event_date);
                                
                                return (
                                    <div
                                        key={event.id}
                                        className={`bg-gradient-to-br ${typeGradient} rounded-2xl p-4 md:p-6 shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 transform`}
                                    >
                                        {/* Event Header */}
                                        <div className="flex justify-between items-start mb-3 md:mb-4">
                                            <div className="flex items-start gap-2 md:gap-3 flex-1 min-w-0">
                                                <span className="text-xl md:text-2xl bg-white/20 backdrop-blur-sm p-2 rounded-xl flex-shrink-0">
                                                    {getTypeIcon(event.event_type)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-white text-sm md:text-lg leading-tight drop-shadow-sm break-words">
                                                        {event.event_name}
                                                    </h4>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-2">
                                                        <span className="text-xs px-2 md:px-3 py-1 rounded-xl bg-white/20 backdrop-blur-sm text-white font-semibold capitalize">
                                                            {event.event_type.replace('_', ' ')}
                                                        </span>
                                                        <span className="text-base md:text-lg">{getPriorityIcon(event.priority)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-xs md:text-sm font-bold text-white bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 md:py-2 rounded-xl shadow-sm mb-2">
                                                    {daysUntil}
                                                </div>
                            </div>
                                        </div>

                                        {/* Event Details */}
                                        <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                                            <div className="text-xs md:text-sm text-white/90 flex items-center gap-2">
                                                <span>📅</span>
                                                <span className="break-all">{formatDate(event.event_date)} {event.event_time && `at ${formatTime(event.event_time)}`}</span>
                                            </div>
                                            {event.class_department && event.class_id && (
                                                <div className="text-xs md:text-sm text-white/90 flex items-center gap-2">
                                                    <span>🎓</span>
                                                    <span className="break-all">{event.class_department} {event.class_id}</span>
                                                </div>
                                            )}
                                            {event.reminder_days > 0 && (
                                                <div className="text-xs md:text-sm text-white/90 flex items-center gap-2">
                                                    <span>🔔</span>
                                                    <span>Reminder: {event.reminder_days} day{event.reminder_days !== 1 ? 's' : ''} before</span>
                                                </div>
                                            )}
                                            <div className="text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 rounded-xl inline-block">
                                                {getEventReason(event)}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => handleToggleComplete(event)}
                                                className="flex-1 px-2 md:px-4 py-2 text-xs md:text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 shadow-sm"
                                            >
                                                ✅ Complete
                                            </button>
                                            <button
                                                onClick={() => onEventClick(event)}
                                                className="px-2 md:px-4 py-2 text-xs md:text-sm bg-white/80 backdrop-blur-sm text-blue-600 border-2 border-blue-200 rounded-xl font-semibold transition-all duration-300 hover:bg-blue-50 hover:border-blue-300 shadow-sm"
                                            >
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UpcomingEvents;