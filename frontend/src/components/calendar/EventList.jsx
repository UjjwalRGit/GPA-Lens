import { useState } from 'react';
import { calendarService } from '../../services/calendar-service.js';
import DeleteEventPopUp from './DeleteEventPopUp.jsx';

function EventList({ events, onEventClick, onEventUpdated, onEventDeleted }) {
    const [deletingEvent, setDeletingEvent] = useState(null);
    const [filter, setFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showDeletePopUp, setShowDelete] = useState(false);
    const [eventToDelete, setEventDelete] = useState(null);

    async function handleToggleComplete(event) {
        try {
            const response = await calendarService.toggleEventCompletion(event.id);
            onEventUpdated(response.data);
        } catch (error) {
            console.error('Error toggling event completion:', error);
            alert('Failed to update event')
        }
    }

    function handleDeleteClick(event) {
        setEventDelete(event);
        setShowDelete(true);
    }

    async function handleDeleteConfirm() {
        if (!eventToDelete) {
            return;
        }

        setShowDelete(false);
        setDeletingEvent(eventToDelete.id);

        try {
            await calendarService.deleteEvent(eventToDelete.id);
            onEventDeleted(eventToDelete.id);
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        } finally {
            setDeletingEvent(null);
            setEventDelete(null);
        }
    }

    function handleDeleteCancel() {
        setShowDelete(false);
        setEventDelete(null);
    }

    function getTypeColor(eventType) {
        const colors = {
            'exam': '#dc2626',
            'quiz': '#ea580c',
            'project': '#7c2d92',
            'due_date': '#c2410c',
            'assignment': '#16a34a',
            'other': '#1d4ed8'
        };
        return colors[eventType] || '#6b7280';
    }

    function getPriorityIcon(priority) {
        const icons = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        };
        return icons[priority] || '🟡';
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

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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

    function isOverdue(dateString) {
        const eventDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < today;
    }

    function isToday(dateString) {
        const eventDate = new Date(dateString);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
    }

    function isTomorrow(dateString) {
        const eventDate = new Date(dateString);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return eventDate.toDateString() === tomorrow.toDateString();
    }

    // Filter events based on current filters
    const filteredEvents = events.filter(event => {
        const matchesStatusFilter = 
            filter === 'all' ||
            (filter === 'upcoming' && !Boolean(event.is_completed)) ||
            (filter === 'completed' && Boolean(event.is_completed));

        const matchesTypeFilter = 
            typeFilter === 'all' || event.event_type === typeFilter;

        return matchesStatusFilter && matchesTypeFilter;
    });

    // Sort events: incomplete first, then by date
    const sortedEvents = filteredEvents.sort((a, b) => {
        // Incomplete events first
        if (Boolean(a.is_completed) !== Boolean(b.is_completed)) {
            return Boolean(a.is_completed) - Boolean(b.is_completed);
        }
        // Then sort by date
        return new Date(a.event_date) - new Date(b.event_date);
    });

    if (events.length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-200/50 p-8 md:p-16 text-center">
                <div className="text-4xl md:text-6xl mb-4 md:mb-6">📋</div>
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 md:mb-4">
                    No events yet!
                </h3>
                <p className="text-gray-600 text-base md:text-lg">
                    Add your first event to get started!
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-200/50 overflow-hidden">
            <DeleteEventPopUp
                isOpen={showDeletePopUp}
                event={eventToDelete}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                isLoading={deletingEvent === eventToDelete?.id}
            />

            {/* Filters Header */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8 border-b border-purple-200/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-lg flex-shrink-0">
                        📋
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            All Events
                        </h3>
                        <p className="text-purple-600/80 text-xs md:text-sm font-medium">
                            Complete overview of your calendar events
                        </p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-purple-700">Status Filter</label>
                            <select 
                                value={filter} 
                                onChange={(e) => setFilter(e.target.value)}
                                className="px-3 md:px-4 py-2 md:py-3 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-xl text-purple-700 font-medium transition-all duration-300 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm md:text-base"
                            >
                                <option value="all">All Events</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-purple-700">Type Filter</label>
                            <select 
                                value={typeFilter} 
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="px-3 md:px-4 py-2 md:py-3 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-xl text-purple-700 font-medium transition-all duration-300 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm md:text-base"
                            >
                                <option value="all">All Types</option>
                                <option value="exam">Exam</option>
                                <option value="quiz">Quiz</option>
                                <option value="project">Project</option>
                                <option value="due_date">Due Date</option>
                                <option value="assignment">Assignment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm px-3 md:px-4 py-2 md:py-3 rounded-xl border-2 border-purple-200 shadow-sm">
                        <span className="text-purple-700 font-semibold text-sm md:text-base">
                            Showing {sortedEvents.length} of {events.length} events
                        </span>
                    </div>
                </div>
            </div>

            {/* Events List */}
            <div className="p-4 md:p-8 space-y-4 md:space-y-6">
                {sortedEvents.map(event => {
                    const eventIsOverdue = isOverdue(event.event_date) && !Boolean(event.is_completed);
                    const eventIsToday = isToday(event.event_date);
                    const eventIsTomorrow = isTomorrow(event.event_date);
                    
                    return (
                        <div
                            key={event.id}
                            className={`backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
                                Boolean(event.is_completed) 
                                    ? 'opacity-70 border-gray-200/50' 
                                    : eventIsOverdue 
                                        ? 'border-red-300 bg-gradient-to-r from-red-50/80 to-pink-50/80'
                                        : eventIsToday 
                                            ? 'border-orange-300 bg-gradient-to-r from-orange-50/80 to-yellow-50/80'
                                            : eventIsTomorrow 
                                                ? 'border-yellow-300 bg-gradient-to-r from-yellow-50/80 to-amber-50/80'
                                                : 'border-purple-200/50 hover:border-purple-300'
                            } shadow-lg`}
                        >
                            {/* Event Header */}
                            <div className="flex flex-col lg:flex-row justify-between items-start mb-4 md:mb-6 gap-4">
                                <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                        <span className="text-2xl md:text-3xl bg-white/80 backdrop-blur-sm p-2 md:p-3 rounded-2xl shadow-sm">
                                            {getTypeIcon(event.event_type)}
                                        </span>
                                        <span className="text-base md:text-lg">{getPriorityIcon(event.priority)}</span>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                            <span
                                                className="text-white text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 rounded-xl font-semibold capitalize inline-block"
                                                style={{ backgroundColor: getTypeColor(event.event_type) }}
                                            >
                                                {event.event_type.replace('_', ' ')}
                                            </span>
                                            {Boolean(event.is_completed) && (
                                                <span className="bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-xl text-xs md:text-sm font-semibold inline-block">
                                                    ✅ Completed
                                                </span>
                                            )}
                                            {eventIsOverdue && !Boolean(event.is_completed) && (
                                                <span className="bg-red-100 text-red-800 px-2 md:px-3 py-1 rounded-xl text-xs md:text-sm font-semibold inline-block">
                                                    ⚠️ Overdue
                                                </span>
                                            )}
                                            {eventIsToday && !Boolean(event.is_completed) && (
                                                <span className="bg-orange-100 text-orange-800 px-2 md:px-3 py-1 rounded-xl text-xs md:text-sm font-semibold inline-block">
                                                    📅 Today
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-2 break-words">
                                            {event.event_name}
                                        </h4>
                                        <div className="text-sm md:text-base text-gray-600 space-y-1">
                                            <div className="flex flex-wrap items-center gap-1 md:gap-2">
                                                <span>📅</span>
                                                <span className="break-all">{formatDate(event.event_date)}</span>
                                                {event.event_time && (
                                                    <>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span className="flex items-center gap-1">
                                                            <span>🕒</span>
                                                            <span>{formatTime(event.event_time)}</span>
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full lg:w-auto lg:flex-shrink-0">
                                    <button
                                        onClick={() => handleToggleComplete(event)}
                                        className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-sm ${
                                            Boolean(event.is_completed)
                                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                        }`}
                                    >
                                        {Boolean(event.is_completed) ? '↩️ Mark Incomplete' : '✅ Complete'}
                                    </button>
                                    <button
                                        onClick={() => onEventClick(event)}
                                        className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
                                    >
                                        👁️ View Details
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(event)}
                                        className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-sm"
                                        disabled={deletingEvent === event.id}
                                    >
                                        {deletingEvent === event.id ? '⏳ Deleting...' : '🗑️ Delete'}
                                    </button>
                                </div>
                            </div>

                            {/* Event Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                                {/* Description */}
                                {event.description && (
                                    <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-gray-200/50 md:col-span-2 xl:col-span-3">
                                        <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm md:text-base">
                                            📝 Description
                                        </h5>
                                        <p className="text-gray-700 text-xs md:text-sm leading-relaxed break-words">
                                            {event.description.length > 100 
                                                ? `${event.description.substring(0, 100)}...` 
                                                : event.description
                                            }
                                        </p>
                                    </div>
                                )}

                                {/* Class Info */}
                                {(event.class_department || event.class_id) && (
                                    <div className="bg-blue-50/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-blue-200/50">
                                        <h5 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-sm md:text-base">
                                            🎓 Class
                                        </h5>
                                        <div className="flex flex-wrap gap-2">
                                            {event.class_department && (
                                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-medium inline-block">
                                                    {event.class_department}
                                                </span>
                                            )}
                                            {event.class_id && (
                                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium inline-block">
                                                    {event.class_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Reminder */}
                                {event.reminder_days > 0 && (
                                    <div className="bg-purple-50/80 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-purple-200/50">
                                        <h5 className="font-semibold text-purple-800 mb-2 flex items-center gap-2 text-sm md:text-base">
                                            🔔 Reminder
                                        </h5>
                                        <p className="text-purple-700 text-xs md:text-sm">
                                            {event.reminder_days} day{event.reminder_days !== 1 ? 's' : ''} before
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                {sortedEvents.length === 0 && (
                    <div className="text-center py-8 md:py-16">
                        <div className="text-4xl md:text-6xl mb-4 md:mb-6">🔍</div>
                        <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent mb-2 md:mb-4">
                            No events match your filters
                        </h3>
                        <p className="text-gray-600 text-base md:text-lg">
                            Try adjusting your filters to see more events.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default EventList;