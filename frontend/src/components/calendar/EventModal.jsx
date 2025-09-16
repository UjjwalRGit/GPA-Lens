import { useState, useEffect } from 'react';
import { calendarService } from '../../services/calendar-service.js';

function EventModal({ event, onEventUpdated, onEventDeleted, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'assignment',
        event_date: '',
        event_time: '',
        class_department: '',
        class_id: '',
        priority: 'medium',
        reminder_days: 1
    });
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    const types = [
        { value: 'exam', label: 'Exam' },
        { value: 'quiz', label: 'Quiz' },
        { value: 'project', label: 'Project' },
        { value: 'due_date', label: 'Due Date' },
        { value: 'assignment', label: 'Assignment' },
        { value: 'other', label: 'Other' }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' }
    ];

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.event_name || '',
                description: event.description || '',
                event_type: event.event_type || 'assignment',
                event_date: event.event_date ? event.event_date.split('T')[0] : '',
                event_time: event.event_time || '',
                class_department: event.class_department || '',
                class_id: event.class_id ? event.class_id.toString() : '',
                priority: event.priority || 'medium',
                reminder_days: event.reminder_days || 1
            });
        }
    }, [event]);

    function getTypeColor(type) {
        const colors = {
            exam: '#dc2626',
            quiz: '#ea580c', 
            project: '#7c2d92',
            due_date: '#c2410c',
            assignment: '#16a34a',
            other: '#1d4ed8'
        };
        return colors[type] || '#6b7280';
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const updatedData = {
                title: formData.title,
                description: formData.description || null,
                event_type: formData.event_type,
                event_date: formData.event_date,
                event_time: formData.event_time || null,
                class_department: formData.class_department || null,
                class_id: formData.class_id ? parseInt(formData.class_id) : null,
                priority: formData.priority,
                reminder_days: parseInt(formData.reminder_days),
                is_completed: event.is_completed
            };

            const response = await calendarService.updateEvent(event.id, updatedData);
            onEventUpdated(response.data);
        } catch (error) {
            console.error('Error updating event:', error);
            setError(error.response?.data?.error || 'Failed to update event');
        } finally {
            setLoading(false);
        }
    }

    async function handleToggleComplete() {
        setLoading(true);
        try {
            const response = await calendarService.toggleEventCompletion(event.id);
            onEventUpdated(response.data);
        } catch (error) {
            console.error('Error toggling completion:', error);
            setError('Failed to update completion status');
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteClick() {
        const confirmed = window.confirm('Are you sure you want to delete this event?');
        if (!confirmed) return;

        setDeleting(true);
        try {
            await calendarService.deleteEvent(event.id);
            onEventDeleted(event.id);
        } catch (error) {
            console.error('Error deleting event:', error);
            setError('Failed to delete event');
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <div 
                className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 md:p-5" 
                onClick={onClose}
            >
                <div 
                    className="bg-white/95 backdrop-blur-lg border border-purple-200/50 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden" 
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div 
                        className="text-white p-6 md:p-8 relative overflow-hidden"
                        style={{
                            background: `linear-gradient(135deg, ${getTypeColor(event.event_type)}, ${getTypeColor(event.event_type)}cc)`
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                        <div className="relative flex justify-between items-center">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div
                                    className="bg-white/20 backdrop-blur-sm text-white px-3 md:px-4 py-1 md:py-2 rounded-xl text-sm font-bold capitalize"
                                >
                                    {event.event_type.replace('_', ' ')}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-black tracking-wide">Edit Event</h3>
                            </div>
                            <button 
                                onClick={onClose} 
                                className="bg-white/20 backdrop-blur-sm border-0 text-white w-10 h-10 md:w-12 md:h-12 rounded-full text-lg cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-white/30 hover:scale-110"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="max-h-[calc(95vh-200px)] overflow-y-auto">
                        {error && (
                            <div className="mx-6 md:mx-8 mt-6">
                                <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 text-red-800 px-4 md:px-6 py-3 md:py-4 rounded-2xl flex items-center gap-3 md:gap-4 shadow-lg">
                                    <span className="text-xl md:text-2xl">⚠️</span>
                                    <span className="font-semibold text-sm md:text-base">{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                            {/* Row 1: Title and Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="flex flex-col">
                                    <label className="mb-2 font-bold text-purple-700 text-sm tracking-wide">
                                        Event Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || deleting}
                                        className="p-3 md:p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-2 font-bold text-purple-700 text-sm tracking-wide">
                                        Event Type *
                                    </label>
                                    <select
                                        name="event_type"
                                        value={formData.event_type}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || deleting}
                                        className="p-3 md:p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300"
                                    >
                                        {types.map(type => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Date, Time, Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <div className="flex flex-col">
                                    <label className="mb-2 font-bold text-purple-700 text-sm tracking-wide">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="event_date"
                                        value={formData.event_date}
                                        onChange={handleChange}
                                        required
                                        disabled={loading || deleting}
                                        className="p-3 md:p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-2 font-bold text-purple-700 text-sm tracking-wide">
                                        Time (Optional)
                                    </label>
                                    <input
                                        type="time"
                                        name="event_time"
                                        value={formData.event_time}
                                        onChange={handleChange}
                                        disabled={loading || deleting}
                                        className="p-3 md:p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-2 font-bold text-purple-700 text-sm tracking-wide">
                                        Priority
                                    </label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleChange}
                                        disabled={loading || deleting}
                                        className="p-3 md:p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300"
                                    >
                                        {priorities.map(priority => (
                                            <option key={priority.value} value={priority.value}>
                                                {priority.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 3: Class Info and Reminder */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                <div className="flex flex-col">
                                    <label className="mb-2 font-bold text-purple-700 text-sm tracking-wide">
                                        Class Department
                                    </label>
                                    <input
                                        type="text"
                                        name="class_department"
                                        value={formData.class_department}
                                        onChange={handleChange}
                                        placeholder="e.g., CSCI"
                                        maxLength="4"
                                        disabled={loading || deleting}
                                        className="p-3 md:p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-2 font-bold text-purple-700 text-sm tracking-wide">
                                        Class ID
                                    </label>
                                    <input
                                        type="number"
                                        name="class_id"
                                        value={formData.class_id}
                                        onChange={handleChange}
                                        placeholder="e.g., 1001"
                                        disabled={loading || deleting}
                                        className="p-3 md:p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="mb-2 font-bold text-purple-700 text-sm tracking-wide">
                                        Reminder (days before)
                                    </label>
                                    <input
                                        type="number"
                                        name="reminder_days"
                                        value={formData.reminder_days}
                                        onChange={handleChange}
                                        min="0"
                                        max="30"
                                        disabled={loading || deleting}
                                        className="p-3 md:p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="flex flex-col">
                                <label className="mb-2 font-bold text-purple-700 text-sm tracking-wide">
                                    Description (Optional)
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Add any additional details about the event..."
                                    rows="3"
                                    disabled={loading || deleting}
                                    className="p-3 md:p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 placeholder-purple-400 resize-none focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Action Buttons */}
                    <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm p-6 md:p-8 border-t border-purple-200/50">
                        <div className="flex flex-col lg:flex-row justify-between gap-4">
                            {/* Save and Cancel */}
                            <div className="flex flex-col sm:flex-row gap-3 lg:flex-1">
                                <button
                                    type="submit"
                                    form="editForm"
                                    onClick={handleSubmit}
                                    disabled={loading || deleting}
                                    className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 tracking-wide"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        '💾 Save Changes'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 tracking-wide"
                                    disabled={loading || deleting}
                                >
                                    ✕ Cancel
                                </button>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={handleToggleComplete}
                                    className={`px-6 md:px-8 py-3 md:py-4 font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none tracking-wide ${
                                        event.is_completed 
                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                                            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                    }`}
                                    disabled={loading || deleting}
                                >
                                    {event.is_completed ? '↩️ Mark Incomplete' : '✅ Mark Complete'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteClick}
                                    className="px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none tracking-wide"
                                    disabled={loading || deleting}
                                >
                                    {deleting ? 'Deleting...' : '🗑️ Delete Event'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default EventModal;