import { useState } from 'react';
import { calendarService } from '../../services/calendar-service.js';
import { useGuestMode } from '../../contexts/GuestModeContext.jsx';
import DeleteEventPopUp from './DeleteEventPopUp.jsx';

function EventList({ events, onEventClick, onEventUpdated, onEventDeleted }) {
    const { isGuestMode, updateGuestEvent, deleteGuestEvent } = useGuestMode();
    const [deletingEvent, setDeletingEvent] = useState(null);
    const [filter, setFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showDeletePopUp, setShowDelete] = useState(false);
    const [eventToDelete, setEventDelete] = useState(null);

    async function handleToggleComplete(event) {
        try {
            const updatedEvent = { ...event, is_completed: !event.is_completed };
            
            if (isGuestMode) {
                // Update in guest storage
                updateGuestEvent(event.id, updatedEvent);
                onEventUpdated(updatedEvent);
            } else {
                // Update via API
                const response = await calendarService.toggleEventCompletion(event.id);
                onEventUpdated(response.data);
            }
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
            if (isGuestMode) {
                // Delete from guest storage
                deleteGuestEvent(eventToDelete.id);
                onEventDeleted(eventToDelete.id);
            } else {
                // Delete via API
                await calendarService.deleteEvent(eventToDelete.id);
                onEventDeleted(eventToDelete.id);
            }
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
        return `in ${diffDays} days`;
    }

    // Filter events
    const filteredEvents = events.filter(event => {
        // Status filter
        if (filter === 'completed' && !event.is_completed) return false;
        if (filter === 'pending' && event.is_completed) return false;
        
        // Type filter
        if (typeFilter !== 'all' && event.event_type !== typeFilter) return false;
        
        return true;
    });

    // Sort by date
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        const dateA = new Date(a.event_date);
        const dateB = new Date(b.event_date);
        return dateA - dateB;
    });

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-4 md:p-8 border border-purple-200/50">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h2 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 md:mb-6">
                    All Events
                </h2>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    {/* Status Filter */}
                    <div className="flex-1">
                        <label className="block text-xs md:text-sm font-bold text-purple-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full p-2 md:p-3 border-2 border-purple-200 rounded-xl text-sm md:text-base bg-purple-50/50 focus:outline-none focus:border-purple-500 transition-all duration-300"
                        >
                            <option value="all">All Events</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div className="flex-1">
                        <label className="block text-xs md:text-sm font-bold text-purple-700 mb-2">
                            Type
                        </label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full p-2 md:p-3 border-2 border-purple-200 rounded-xl text-sm md:text-base bg-purple-50/50 focus:outline-none focus:border-purple-500 transition-all duration-300"
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

                {/* Count */}
                <div className="mt-4 text-sm md:text-base text-gray-600 font-medium">
                    Showing {sortedEvents.length} of {events.length} events
                </div>
            </div>

            {/* Events List */}
            <div className="space-y-3 md:space-y-4">
                {sortedEvents.length === 0 ? (
                    <div className="text-center py-12 md:py-16">
                        <div className="text-5xl md:text-6xl mb-4">📅</div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-700 mb-2">
                            No events found
                        </h3>
                        <p className="text-sm md:text-base text-gray-600">
                            Try adjusting your filters or add a new event
                        </p>
                    </div>
                ) : (
                    sortedEvents.map(event => {
                        const isOverdue = new Date(event.event_date) < new Date() && !event.is_completed;
                        const isDeleting = deletingEvent === event.id;

                        return (
                            <div
                                key={event.id}
                                className={`
                                    bg-white rounded-2xl p-4 md:p-6 border-2 shadow-lg transition-all duration-300
                                    ${isDeleting ? 'opacity-50 pointer-events-none' : 'hover:shadow-xl hover:-translate-y-1'}
                                    ${event.is_completed ? 'border-green-300 bg-green-50/50' : 'border-purple-200'}
                                    ${isOverdue ? 'border-red-300 bg-red-50/50' : ''}
                                `}
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    {/* Event Info */}
                                    <div 
                                        className="flex-1 cursor-pointer"
                                        onClick={() => onEventClick(event)}
                                    >
                                        {/* Title and Type */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="text-2xl md:text-3xl">{getTypeIcon(event.event_type)}</span>
                                            <div className="flex-1">
                                                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
                                                    {event.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span
                                                        className="px-3 py-1 rounded-lg text-xs font-semibold text-white capitalize"
                                                        style={{ backgroundColor: getTypeColor(event.event_type) }}
                                                    >
                                                        {event.event_type.replace('_', ' ')}
                                                    </span>
                                                    <span className="text-lg md:text-xl">{getPriorityIcon(event.priority)}</span>
                                                    {event.is_completed && (
                                                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-green-500 text-white">
                                                            ✅ Completed
                                                        </span>
                                                    )}
                                                    {isOverdue && (
                                                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-red-500 text-white">
                                                            ⚠️ Overdue
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {event.description && (
                                            <p className="text-sm md:text-base text-gray-600 mb-3 ml-10 md:ml-11">
                                                {event.description.length > 100
                                                    ? `${event.description.substring(0, 100)}...`
                                                    : event.description
                                                }
                                            </p>
                                        )}

                                        {/* Details */}
                                        <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600 ml-10 md:ml-11">
                                            <div className="flex items-center gap-1">
                                                <span>📅</span>
                                                <span className="font-medium">{formatDate(event.event_date)}</span>
                                                <span className="text-purple-600 font-semibold">({getDaysUntil(event.event_date)})</span>
                                            </div>
                                            {event.event_time && (
                                                <div className="flex items-center gap-1">
                                                    <span>🕐</span>
                                                    <span className="font-medium">{formatTime(event.event_time)}</span>
                                                </div>
                                            )}
                                            {(event.class_department || event.class_id) && (
                                                <div className="flex items-center gap-1">
                                                    <span>📚</span>
                                                    <span className="font-medium">
                                                        {event.class_department} {event.class_id}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex md:flex-col gap-2">
                                        <button
                                            onClick={() => handleToggleComplete(event)}
                                            disabled={isDeleting}
                                            className={`
                                                px-3 md:px-4 py-2 font-bold rounded-xl shadow-md transition-all duration-300 
                                                hover:shadow-lg hover:-translate-y-0.5 text-xs md:text-sm
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                ${event.is_completed
                                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                                }
                                            `}
                                        >
                                            {event.is_completed ? '↩️ Undo' : '✅ Done'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(event)}
                                            disabled={isDeleting}
                                            className="px-3 md:px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-sm"
                                        >
                                            {isDeleting ? '...' : '🗑️'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Delete Confirmation */}
            {showDeletePopUp && eventToDelete && (
                <DeleteEventPopUp
                    event={eventToDelete}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                />
            )}
        </div>
    );
}

export default EventList;