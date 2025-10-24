import { calendarService } from '../../services/calendar-service.js';
import { useState } from 'react';
import { useGuestMode } from '../../contexts/GuestModeContext.jsx';

function EventViewModal({ event, onEdit, onEventUpdated, onEventDeleted, onClose }) {
    const { isGuestMode, updateGuestEvent, deleteGuestEvent } = useGuestMode();
    const [loading, setLoading] = useState(false);
    const [showFullDescription, setShowFullDescription] = useState(false);

    // Debug: Log the event object to see what's happening
    console.log('EventViewModal - Full event object:', event);
    console.log('EventViewModal - event.is_completed:', event.is_completed, 'type:', typeof event.is_completed);

    function getTypeGradient(type) {
        const gradients = {
            exam: 'linear-gradient(135deg, #ef4444, #dc2626)',
            quiz: 'linear-gradient(135deg, #f97316, #ea580c)',
            project: 'linear-gradient(135deg, #a855f7, #9333ea)',
            due_date: 'linear-gradient(135deg, #ec4899, #db2777)',
            assignment: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            other: 'linear-gradient(135deg, #10b981, #059669)'
        };
        return gradients[type] || 'linear-gradient(135deg, #6b7280, #4b5563)';
    }

    function getPriorityColor(priority) {
        const colors = {
            high: '#dc2626',
            medium: '#d97706', 
            low: '#16a34a'
        };
        return colors[priority] || '#6b7280';
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
        if (!timeString) return null;
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    function truncateDescription(description, maxLength = 150) {
        if (!description) return '';
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength).trim() + '...';
    }

    async function handleToggleComplete() {
        setLoading(true);
        try {
            const updatedEvent = { ...event, is_completed: !Boolean(event.is_completed) };
            
            if (isGuestMode) {
                // Update in guest storage
                updateGuestEvent(event.id, updatedEvent);
                onEventUpdated(updatedEvent);
            } else {
                // Update via API
                await calendarService.toggleEventCompletion(event.id);
                onEventUpdated(updatedEvent);
            }
        } catch (error) {
            console.error('Error toggling event completion:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm('Are you sure you want to delete this event?');
        if (!confirmed) return;

        setLoading(true);
        try {
            if (isGuestMode) {
                // Delete from guest storage
                deleteGuestEvent(event.id);
                onEventDeleted(event.id);
            } else {
                // Delete via API
                await calendarService.deleteEvent(event.id);
                onEventDeleted(event.id);
            }
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        } finally {
            setLoading(false);
        }
    }

    const isOverdue = new Date(event.event_date) < new Date() && Boolean(event.is_completed) === false;
    const isToday = new Date(event.event_date).toDateString() === new Date().toDateString();

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 lg:p-8 z-50">
            <div 
                className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-hidden border border-purple-200/50 flex flex-col" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div 
                    className="text-white p-4 sm:p-6 lg:p-8 relative overflow-hidden"
                    style={{
                        background: getTypeGradient(event.event_type)
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                    <div className="relative flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                <span
                                    className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold capitalize"
                                >
                                    {String(event.event_type || 'event').replace('_', ' ')}
                                </span>
                                {Boolean(event.is_completed) === true && (
                                    <span className="bg-green-500/20 backdrop-blur-sm px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold">
                                        ✅ Completed
                                    </span>
                                )}
                                {isOverdue && (
                                    <span className="bg-red-500/20 backdrop-blur-sm px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold">
                                        ⚠️ Overdue
                                    </span>
                                )}
                                {isToday && Boolean(event.is_completed) === false && (
                                    <span className="bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-xl text-xs sm:text-sm font-semibold">
                                        📅 Today
                                    </span>
                                )}
                            </div>
                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 break-words">
                                {String(event.event_name || event.title || 'Untitled Event')}
                            </h2>
                            <p className="text-white/80 text-sm sm:text-base lg:text-lg">
                                📅 {formatDate(event.event_date)}
                                {event.event_time && (
                                    <span className="ml-2 sm:ml-4">
                                        🕐 {formatTime(event.event_time)}
                                    </span>
                                )}
                            </p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="ml-2 sm:ml-4 bg-white/20 backdrop-blur-sm text-white w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full text-base sm:text-lg cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-white/30 hover:scale-110 border-0 flex-shrink-0"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="space-y-4 sm:space-y-6">
                        {/* Description */}
                        {event.description && (
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-purple-200">
                                <h3 className="text-base sm:text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
                                    📝 Description
                                </h3>
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {showFullDescription || event.description.length <= 150 
                                        ? event.description 
                                        : truncateDescription(event.description)
                                    }
                                </p>
                                {event.description.length > 150 && (
                                    <button
                                        onClick={() => setShowFullDescription(!showFullDescription)}
                                        className="mt-3 text-purple-600 hover:text-purple-800 font-semibold text-sm transition-colors"
                                    >
                                        {showFullDescription ? 'Show Less' : 'Show More'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Event Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {/* Priority */}
                            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div 
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: getPriorityColor(event.priority) }}
                                    ></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Priority</p>
                                        <p className="text-base sm:text-lg font-bold text-gray-800 capitalize">
                                            {event.priority || 'Medium'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Class Info */}
                            {(event.class_department || event.class_id) && (
                                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">📚</span>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Class</p>
                                            <p className="text-base sm:text-lg font-bold text-gray-800">
                                                {event.class_department} {event.class_id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reminder */}
                            {event.reminder_days !== null && event.reminder_days !== undefined && (
                                <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🔔</span>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Reminder</p>
                                            <p className="text-base sm:text-lg font-bold text-gray-800">
                                                {event.reminder_days} {event.reminder_days === 1 ? 'day' : 'days'} before
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {Boolean(event.is_completed) ? '✅' : '⏳'}
                                    </span>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium">Status</p>
                                        <p className="text-base sm:text-lg font-bold text-gray-800">
                                            {Boolean(event.is_completed) ? 'Completed' : 'Pending'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={onEdit}
                            disabled={loading}
                            className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            ✏️ Edit Event
                        </button>
                        <button
                            onClick={handleToggleComplete}
                            disabled={loading}
                            className={`flex-1 px-4 sm:px-6 py-3 font-bold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base ${
                                Boolean(event.is_completed)
                                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Processing...
                                </>
                            ) : Boolean(event.is_completed) ? (
                                '↩️ Mark Incomplete'
                            ) : (
                                '✅ Mark Complete'
                            )}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventViewModal;