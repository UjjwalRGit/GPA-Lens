import { useState } from 'react';
import EventModal from './EventModal.jsx';

function CalendarView({ currentDate, groupedEvents, onDateClick, onEventClick, onMonthChange, onEventUpdated, onEventDeleted }) {
    const [selectedEvent, setSelectedEvent] = useState(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const days = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 
        'Saturday', 'Sunday'
    ];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfTheMonth = new Date(year, month, 1);
    const lastDayOfTheMonth = new Date(year, month + 1, 0);
    const firstWeekday = firstDayOfTheMonth.getDay();
    const daysInTheMonth = lastDayOfTheMonth.getDate();

    const prevMonth = new Date(year, month - 1, 0);
    const daysInThePrevMonth = prevMonth.getDate();

    function formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    function generateDays() {
        const days = [];

        let i;
        for (i = firstWeekday - 1; i >= 0; i--) {
            const day = daysInThePrevMonth - i;
            const date = new Date(year, month - 1, day);
            days.push({day, date, isCurrentMonth: false, 
                isPrevMonth: true, dateKey: formatDateKey(date)});
        }

        for (let day = 1; day <= daysInTheMonth; day++) {
            const date = new Date(year, month, day);
            days.push({day, date, isCurrentMonth: true, dateKey: formatDateKey(date)});
        }

        const remainingDays = 42 - days.length;
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month + 1, day);
            days.push({day, date, isCurrentMonth: false, 
                isNextMonth: true, dateKey: formatDateKey(date)});
        }
        return days;
    }

    function isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    function getTypeGradient(eventType) {
        const gradients = {
            'exam': 'bg-gradient-to-r from-red-500 to-red-600',
            'quiz': 'bg-gradient-to-r from-orange-500 to-orange-600',
            'project': 'bg-gradient-to-r from-purple-500 to-purple-600',
            'due_date': 'bg-gradient-to-r from-pink-500 to-pink-600',
            'assignment': 'bg-gradient-to-r from-blue-500 to-blue-600',
            'other': 'bg-gradient-to-r from-green-500 to-emerald-500'
        };
        return gradients[eventType] || 'bg-gradient-to-r from-gray-500 to-gray-600';
    }

    function getPriorityIcon(priority) {
        const icons = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        };
        return icons[priority] || '';
    }

    function handleEventClick(event, e) {
        e.stopPropagation();
        setSelectedEvent(event);
    }

    function handleEventUpdated(updatedEvent) {
        onEventUpdated(updatedEvent);
        setSelectedEvent(null);
    }

    function handleEventDeleted(eventId) {
        onEventDeleted(eventId);
        setSelectedEvent(null);
    }

    const calendarDays = generateDays();

    return (
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-200/50 overflow-hidden">
            {selectedEvent && (
                <EventModal
                    event={selectedEvent}
                    onEventUpdated={handleEventUpdated}
                    onEventDeleted={handleEventDeleted}
                    onClose={() => setSelectedEvent(null)}
                />
            )}

            {/* Calendar Navigation */}
            <div className="bg-gradient-to-r from-purple-100/80 to-indigo-100/80 backdrop-blur-sm p-4 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-purple-200/50">
                <button
                    onClick={() => onMonthChange(-1)}
                    className="bg-white/80 backdrop-blur-sm text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-800 shadow-lg px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all duration-300 tracking-wide hover:shadow-xl hover:-translate-y-1 text-sm md:text-base"
                >
                    ← Prev
                </button>
                
                <h2 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 tracking-wider text-center">
                    {months[month]} {year}
                </h2>
                
                <button
                    onClick={() => onMonthChange(1)}
                    className="bg-white/80 backdrop-blur-sm text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-800 shadow-lg px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all duration-300 tracking-wide hover:shadow-xl hover:-translate-y-1 text-sm md:text-base"
                >
                    Next →
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-0 bg-gradient-to-r from-purple-50/90 to-indigo-50/90 backdrop-blur-sm border-b border-purple-200/50">
                {days.map(day => (
                    <div key={day} className="p-2 md:p-4 text-center font-bold text-purple-700 tracking-wide text-xs md:text-sm">
                        <span className="hidden sm:inline">{day}</span>
                        <span className="sm:hidden">{day.substring(0, 3)}</span>
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0">
                {calendarDays.map((info, index) => {
                    const events = groupedEvents[info.dateKey] || [];
                    const isCurrentDay = isToday(info.date);
                    const maxEvents = window.innerWidth < 640 ? 2 : 3;
                    const truncateLength = window.innerWidth < 640 ? 8 : 12;
                    
                    return (
                        <div
                            key={index}
                            className={`min-h-[80px] sm:min-h-[100px] md:min-h-[120px] p-1 sm:p-2 md:p-3 cursor-pointer transition-all duration-300 border border-purple-100/50 hover:shadow-lg hover:bg-purple-50/50 ${
                                !info.isCurrentMonth ? 
                                    'bg-purple-50/30 text-purple-400 hover:bg-purple-100/40' 
                                    : 'bg-white/60 hover:bg-purple-50/60'
                            } ${
                                isCurrentDay ? 'bg-gradient-to-br from-purple-100/80 to-indigo-100/80 border-2 border-purple-400/70 shadow-lg' : ''
                            }`}
                            onClick={() => onDateClick(info.date)}
                        >
                            <div className={`font-bold mb-1 md:mb-2 text-xs sm:text-sm md:text-base ${
                                isCurrentDay ? 'text-purple-600' : 
                                !info.isCurrentMonth ? 'text-purple-400' : 'text-purple-700'
                            }`}>
                                {info.day}
                            </div>

                            <div className="flex-1 space-y-1">
                                {events.slice(0, maxEvents).map(event => (
                                    <div
                                        key={event.id}
                                        className={`text-white text-xs px-1 sm:px-2 py-1 rounded-lg md:rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg shadow-md flex items-center gap-1 ${
                                            getTypeGradient(event.event_type)
                                        } ${
                                            !info.isCurrentMonth ? 'opacity-50' : ''
                                        } ${
                                            event.is_completed ? 'opacity-60' : ''
                                        }`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                        title={`${event.event_name} - ${event.event_type}`}
                                    >
                                        <span className="text-xs hidden sm:inline">
                                            {getPriorityIcon(event.priority)}
                                        </span>
                                        <span className="flex-1 truncate font-medium text-xs">
                                            {event.event_name.length > truncateLength ?
                                                event.event_name.substring(0, truncateLength) + '...'
                                                : event.event_name
                                            }
                                        </span>
                                        {Boolean(event.is_completed) && (
                                            <span className="text-xs">✅</span>
                                        )}
                                    </div>
                                ))}
                                {events.length > maxEvents && (
                                    <div className={`text-center text-xs cursor-pointer hover:text-purple-600 transition-colors font-medium ${
                                        !info.isCurrentMonth ? 'text-purple-400' : 'text-purple-500'
                                    }`}>
                                        +{events.length - maxEvents}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 backdrop-blur-sm p-3 md:p-6 border-t border-purple-200/50">
                <h4 className="text-purple-700 font-bold mb-2 md:mb-4 flex items-center gap-2 tracking-wide text-sm md:text-base">
                    🎨 Event Types:
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-4 md:justify-center">
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium text-purple-600">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-lg bg-gradient-to-r from-red-500 to-red-600 shadow-sm flex-shrink-0"></div>
                        <span>Exam</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium text-purple-600">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 shadow-sm flex-shrink-0"></div>
                        <span>Quiz</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium text-purple-600">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 shadow-sm flex-shrink-0"></div>
                        <span>Project</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium text-purple-600">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 shadow-sm flex-shrink-0"></div>
                        <span>Due Date</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium text-purple-600">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm flex-shrink-0"></div>
                        <span>Assignment</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm font-medium text-purple-600">
                        <div className="w-3 h-3 md:w-4 md:h-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm flex-shrink-0"></div>
                        <span>Other</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CalendarView;