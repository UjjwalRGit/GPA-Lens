import { calendarService } from '../../services/calendar-service.js';
import { useState } from 'react';

function EventViewModal({ event, onEdit, onEventUpdated, onEventDeleted, onClose }) {
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
            await calendarService.toggleEventCompletion(event.id);
            const updatedEvent = { ...event, is_completed: !Boolean(event.is_completed) };
            onEventUpdated(updatedEvent);
        } catch (error) {
            console.error('Error toggling event completion:', error);
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
                                    <span className="ml-3">
                                        🕒 {formatTime(event.event_time)}
                                    </span>
                                )}
                            </p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="bg-white/20 backdrop-blur-sm border-0 text-white w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full text-sm sm:text-base lg:text-lg cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-white/30 hover:scale-110 flex-shrink-0 ml-4"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 space-y-4 sm:space-y-6">
                    {/* Description */}
                    {event.description && (
                        <div className="bg-purple-50/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-200/50">
                            <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg lg:text-xl">
                                📝 Description
                            </h3>
                            <div className="text-purple-700 leading-relaxed break-words whitespace-pre-wrap text-sm sm:text-base lg:text-lg">
                                {showFullDescription ? (
                                    <>
                                        {event.description}
                                        {event.description.length > 150 && (
                                            <button
                                                onClick={() => setShowFullDescription(false)}
                                                className="block mt-3 text-blue-600 hover:text-blue-800 text-sm lg:text-base font-medium transition-colors"
                                            >
                                                Show less
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {truncateDescription(event.description)}
                                        {event.description.length > 150 && (
                                            <button
                                                onClick={() => setShowFullDescription(true)}
                                                className="block mt-3 text-blue-600 hover:text-blue-800 text-sm lg:text-base font-medium transition-colors"
                                            >
                                                Show more
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Event Details Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Priority */}
                        <div className="bg-purple-50/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-200/50">
                            <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg lg:text-xl">
                                🎯 Priority
                            </h4>
                            <span 
                                className="inline-block px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-white font-medium text-sm sm:text-base lg:text-lg"
                                style={{ backgroundColor: getPriorityColor(event.priority) }}
                            >
                                {event.priority ? event.priority.charAt(0).toUpperCase() + event.priority.slice(1) : 'Medium'}
                            </span>
                        </div>

                        {/* Reminder */}
                        <div className="bg-purple-50/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-200/50">
                            <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg lg:text-xl">
                                🔔 Reminder
                            </h4>
                            <p className="text-purple-700 text-sm sm:text-base lg:text-lg">
                                {event.reminder_days && event.reminder_days > 0 
                                    ? `${event.reminder_days} day${event.reminder_days !== 1 ? 's' : ''} before` 
                                    : 'No reminder'
                                }
                            </p>
                        </div>

                        {/* Class Info (if applicable) */}
                        {(event.class_department || event.class_id) && (
                            <div className="bg-purple-50/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-purple-200/50 lg:col-span-2 xl:col-span-1">
                                <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2 text-sm sm:text-base md:text-lg lg:text-xl">
                                    🎓 Class Information
                                </h4>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {event.class_department && (
                                        <span className="bg-blue-100 text-blue-800 px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm sm:text-base lg:text-lg font-medium">
                                            {event.class_department}
                                        </span>
                                    )}
                                    {event.class_id && (
                                        <span className="bg-green-100 text-green-800 px-3 sm:px-4 lg:px-6 py-2 lg:py-3 rounded-xl text-sm sm:text-base lg:text-lg font-medium">
                                            {event.class_id}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Action Buttons at Bottom */}
                <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm border-t border-purple-200/50 p-4 sm:p-6 lg:p-8 rounded-b-3xl">
                    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
                        <div className="flex-1 flex flex-col sm:flex-row gap-3 lg:gap-4">
                            <button
                                onClick={handleToggleComplete}
                                disabled={loading}
                                className={`flex-1 px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none tracking-wide text-sm sm:text-base lg:text-lg ${
                                    Boolean(event.is_completed) === true
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                }`}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Updating...
                                    </div>
                                ) : (
                                    <>
                                        {Boolean(event.is_completed) === true ? '↩️ Mark Incomplete' : '✅ Mark Complete'}
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <button
                            onClick={onEdit}
                            disabled={loading}
                            className="px-6 sm:px-8 lg:px-12 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none tracking-wide text-sm sm:text-base lg:text-lg"
                        >
                            ✏️ Edit Event
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EventViewModal;