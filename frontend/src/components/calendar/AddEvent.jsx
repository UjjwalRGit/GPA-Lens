import { useState } from 'react';
import { calendarService } from '../../services/calendar-service.js';

function AddEvent({ selectedDate, onEventAdded, onCancel }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'assignment',
        event_date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        event_time: '',
        class_department: '',
        class_id: '',
        priority: 'medium',
        reminder_days: 1
    });
    const [loading, setLoading] = useState(false);
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
            const eventData = {
                title: formData.title,
                description: formData.description || null,
                event_type: formData.event_type,
                event_date: formData.event_date,
                event_time: formData.event_time || null,
                class_department: formData.class_department || null,
                class_id: formData.class_id ? parseInt(formData.class_id) : null,
                priority: formData.priority,
                reminder_days: parseInt(formData.reminder_days)
            };

            console.log('Sending event data: ', eventData);

            const response = await calendarService.createEvent(eventData);
            console.log('Event created: ', response.data);

            onEventAdded(response.data);

            setFormData({
                title: '',
                description: '',
                event_type: 'assignment',
                event_date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
                event_time: '',
                class_department: '',
                class_id: '',
                priority: 'medium',
                reminder_days: 1
            });
        } catch (error) {
            console.error('Error creating event: ', error);
            setError(error.response?.data?.error || 'Failed to create event');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 md:p-5">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden border border-purple-200/50">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 md:p-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-black tracking-wide">Add New Event</h3>
                            <p className="text-purple-100 mt-2 font-medium text-sm md:text-base">
                                Create a new calendar event to track your schedule
                            </p>
                        </div>
                        <button 
                            onClick={onCancel} 
                            className="bg-white/20 backdrop-blur-sm border-0 text-white w-10 h-10 md:w-12 md:h-12 rounded-full text-lg cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-white/30 hover:scale-110"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Form Container */}
                <div className="max-h-[calc(95vh-120px)] overflow-y-auto">
                    {error && (
                        <div className="mx-6 md:mx-8 mt-6">
                            <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 text-red-800 px-4 md:px-6 py-3 md:py-4 rounded-2xl flex items-center gap-3 md:gap-4 shadow-lg">
                                <span className="text-xl md:text-2xl">⚠️</span>
                                <span className="font-semibold text-sm md:text-base">{error}</span>
                            </div>
                        </div>
                    )}

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
                                    placeholder="e.g., Math Quiz 3"
                                    required
                                    disabled={loading}
                                    className="p-3 md:p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300"
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                    disabled={loading}
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
                                disabled={loading}
                                className="p-3 md:p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 placeholder-purple-400 resize-none focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-100 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 md:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 tracking-wide"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating Event...
                                    </>
                                ) : (
                                    <>
                                        ➕ Create Event
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-8 py-3 md:py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 tracking-wide"
                                disabled={loading}
                            >
                                ✕ Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddEvent;