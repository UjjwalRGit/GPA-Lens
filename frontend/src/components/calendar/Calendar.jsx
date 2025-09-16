import { useState, useEffect } from 'react';
import { calendarService } from '../../services/calendar-service.js';
import CalendarView from './CalendarView.jsx';
import EventList from './EventList.jsx';
import AddEvent from './AddEvent.jsx';
import EventModal from './EventModal.jsx';
import EventViewModal from './EventViewModal.jsx';
import UpcomingEvents from './UpcomingEvents.jsx';

function Calendar() {
    const [events, setEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [groupedEvents, setGroupedEvents] = useState({});
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [viewMode, setViewMode] = useState('dashboard');

    // Load all events once when component mounts
    useEffect(() => {
        loadAllEvents();
        loadUpcomingEvents();
    }, []);

    // Update monthly view when currentDate changes or allEvents change
    useEffect(() => {
        if (allEvents.length >= 0) {
            updateMonthlyView();
        }
    }, [currentDate, allEvents]);

    async function loadAllEvents() {
        try {
            setLoading(true);
            const response = await calendarService.getEvents();
            setAllEvents(response.data);
        } catch (error) {
            setError('Failed to load all events');
            console.error('Error loading all events:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadUpcomingEvents() {
        try {
            const response = await calendarService.getUpcomingEvents(10);
            setUpcomingEvents(response.data);
        } catch (error) {
            console.error('Error loading upcoming events:', error);
        }
    }

    function updateMonthlyView() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Filter events for the current month from allEvents
        const monthlyEvents = allEvents.filter(event => {
            const eventDate = new Date(event.event_date);
            return eventDate.getFullYear() === year && eventDate.getMonth() === month;
        });

        // Group events by date
        const grouped = monthlyEvents.reduce((acc, event) => {
            const dateKey = event.event_date.split('T')[0];
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(event);
            return acc;
        }, {});

        setGroupedEvents(grouped);
        setEvents(monthlyEvents);
    }

    async function handleEventAdded(newEvent) {
        // Add to allEvents (this will trigger useEffect to update monthly view)
        setAllEvents(prevAllEvents => [newEvent, ...prevAllEvents]);
        
        // Update upcoming events if it's upcoming
        const eventDate = new Date(newEvent.event_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (eventDate >= today && !newEvent.is_completed) {
            setUpcomingEvents(prevUpcoming => [newEvent, ...prevUpcoming]);
        }
        
        setShowAddForm(false);
        setSelectedDate(null);
    }

    function handleEventUpdated(updatedEvent) {
        // Update allEvents (this will trigger useEffect to update monthly view)
        setAllEvents(prevAllEvents =>
            prevAllEvents.map(event =>
                event.id === updatedEvent.id ? updatedEvent : event
            )
        );

        // Update upcoming events
        setUpcomingEvents(prevUpcoming =>
            prevUpcoming.map(event =>
                event.id === updatedEvent.id ? updatedEvent : event
            ).filter(event => {
                const eventDate = new Date(event.event_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return eventDate >= today && !event.is_completed;
            })
        );

        setSelectedEvent(null);
        setShowEditModal(false);
    }

    function handleEventDelete(eventId) {
        // Remove from allEvents (this will trigger useEffect to update monthly view)
        setAllEvents(prevAllEvents =>
            prevAllEvents.filter(event => event.id !== eventId)
        );

        // Remove from upcoming events
        setUpcomingEvents(prevUpcoming =>
            prevUpcoming.filter(event => event.id !== eventId)
        );

        setSelectedEvent(null);
        setShowEditModal(false);
    }

    function handleDateClick(date) {
        setSelectedDate(date);
        setShowAddForm(true);
    }

    function handleEventClick(event) {
        setSelectedEvent(event);
        setShowEditModal(false); // Start with view modal, not edit modal
    }

    function handleEditEvent() {
        setShowEditModal(true);
    }

    function handleCloseViewModal() {
        setSelectedEvent(null);
        setShowEditModal(false);
    }

    function handleCloseEditModal() {
        setShowEditModal(false);
        // Keep selectedEvent so view modal stays open
    }

    function handleMonthChange(direction) {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(newDate.getMonth() + direction);
            return newDate;
        });
    }

    // Get priority upcoming events (next 10 days + high priority events)
    function getPriorityUpcomingEvents() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tenDaysFromNow = new Date(today);
        tenDaysFromNow.setDate(today.getDate() + 10);
        
        return allEvents.filter(event => {
            if (event.is_completed) return false;
            
            const eventDate = new Date(event.event_date);
            eventDate.setHours(0, 0, 0, 0);
            
            // Include if within next 10 days OR high priority
            return (eventDate >= today && eventDate <= tenDaysFromNow) || 
                   (event.priority === 'high' && eventDate >= today);
        }).sort((a, b) => {
            const dateA = new Date(a.event_date);
            const dateB = new Date(b.event_date);
            
            // Sort by priority first (high priority first), then by date
            if (a.priority === 'high' && b.priority !== 'high') return -1;
            if (a.priority !== 'high' && b.priority === 'high') return 1;
            
            return dateA - dateB;
        });
    }

    // Calculate stats for dashboard
    const totalEvents = allEvents.length;
    const completedEvents = allEvents.filter(event => event.is_completed).length;
    const priorityUpcomingEvents = getPriorityUpcomingEvents();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center font-sans">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-purple-200/50">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="text-xl font-semibold text-purple-800">Loading your calendar...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 font-sans">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header Section */}
                <div className="text-center mb-8 md:mb-12">
                    {/* Responsive Header */}
                    <div className="flex items-center justify-center gap-2 md:gap-6 mb-6 md:mb-8">
                        <div className="text-center">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent tracking-tight leading-tight">
                                Calendar
                            </h1>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-6 md:mb-8">
                        <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-8 text-white transform hover:scale-105 transition-all duration-300 border border-blue-400/20">
                            <h3 className="text-blue-100 font-bold mb-2 md:mb-3 text-sm md:text-lg tracking-wide">Total Events</h3>
                            <div className="text-3xl md:text-5xl font-black mb-1 md:mb-2">
                                {totalEvents}
                            </div>
                            <p className="text-blue-200 font-medium text-xs md:text-base">All Events</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-8 text-white transform hover:scale-105 transition-all duration-300 border border-green-400/20">
                            <h3 className="text-green-100 font-bold mb-2 md:mb-3 text-sm md:text-lg tracking-wide">Priority Events</h3>
                            <div className="text-3xl md:text-5xl font-black mb-1 md:mb-2">
                                {priorityUpcomingEvents.length}
                            </div>
                            <p className="text-green-200 font-medium text-xs md:text-base">Upcoming Priority</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-600 to-purple-700 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-8 text-white transform hover:scale-105 transition-all duration-300 border border-pink-400/20 sm:col-span-2 lg:col-span-1">
                            <h3 className="text-pink-100 font-bold mb-2 md:mb-3 text-sm md:text-lg tracking-wide">Completed</h3>
                            <div className="text-3xl md:text-5xl font-black mb-1 md:mb-2">
                                {completedEvents}
                            </div>
                            <p className="text-pink-200 font-medium text-xs md:text-base">Finished Events</p>
                        </div>
                    </div>
                </div>
                
                {error && (
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 text-red-800 px-6 py-4 rounded-2xl mb-8 flex items-center gap-4 shadow-lg">
                        <span className="text-2xl">⚠️</span>
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Controls Section */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-10">
                    <div className="flex flex-wrap justify-center gap-4">
                        <button 
                            onClick={() => setViewMode('dashboard')} 
                            className={`px-8 py-4 font-bold rounded-2xl transition-all duration-300 tracking-wide ${
                                viewMode === 'dashboard' 
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 ring-4 ring-purple-200' 
                                    : 'bg-white/80 backdrop-blur-sm text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-800 shadow-lg'
                            }`}
                        >
                            📊 Dashboard View
                        </button>
                        <button 
                            onClick={() => setViewMode('calendar')} 
                            className={`px-8 py-4 font-bold rounded-2xl transition-all duration-300 tracking-wide ${
                                viewMode === 'calendar' 
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 ring-4 ring-purple-200' 
                                    : 'bg-white/80 backdrop-blur-sm text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-800 shadow-lg'
                            }`}
                        >
                            📅 Calendar View
                        </button>
                        <button 
                            onClick={() => setViewMode('list')} 
                            className={`px-8 py-4 font-bold rounded-2xl transition-all duration-300 tracking-wide ${
                                viewMode === 'list' 
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 ring-4 ring-purple-200' 
                                    : 'bg-white/80 backdrop-blur-sm text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-800 shadow-lg'
                            }`}
                        >
                            📋 List View
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => setShowAddForm(true)} 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 tracking-wide ring-2 ring-green-200"
                    >
                        ➕ Add New Event
                    </button>
                </div>

                {/* Main Content */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-200/50 p-8">
                    {viewMode === 'dashboard' ? (
                        <div className="space-y-8">
                            {/* Priority Events Section */}
                            {priorityUpcomingEvents.length > 0 && (
                                <div>
                                    <UpcomingEvents 
                                        events={priorityUpcomingEvents}
                                        onEventClick={handleEventClick}
                                        onEventUpdated={handleEventUpdated}
                                        onEventDeleted={handleEventDelete}
                                    />
                                </div>
                            )}
                            
                            {/* Other Events Section */}
                            {(() => {
                                const otherEvents = allEvents.filter(event => {
                                    if (event.is_completed) return false;
                                    
                                    const eventDate = new Date(event.event_date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    eventDate.setHours(0, 0, 0, 0);
                                    
                                    // Exclude events that are already in priority list
                                    const isPriorityEvent = priorityUpcomingEvents.some(pe => pe.id === event.id);
                                    
                                    // Show upcoming events that aren't priority
                                    return eventDate >= today && !isPriorityEvent;
                                }).sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

                                return otherEvents.length > 0 && (
                                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200/50">
                                        <h3 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-blue-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                                            📋 Other Upcoming Events
                                        </h3>
                                        <div className="grid gap-3">
                                            {otherEvents.slice(0, 8).map(event => {
                                                const eventDate = new Date(event.event_date);
                                                const isToday = eventDate.toDateString() === new Date().toDateString();
                                                const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                                                
                                                let dateDisplay;
                                                if (isToday) {
                                                    dateDisplay = 'Today';
                                                } else if (isTomorrow) {
                                                    dateDisplay = 'Tomorrow';
                                                } else {
                                                    dateDisplay = eventDate.toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric',
                                                        weekday: 'short'
                                                    });
                                                }

                                                return (
                                                    <div 
                                                        key={event.id}
                                                        onClick={() => handleEventClick(event)}
                                                        className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                                                                    {event.title}
                                                                </h4>
                                                                {event.description && (
                                                                    <p className="text-gray-600 text-sm mt-1">
                                                                        {event.description.length > 50 
                                                                            ? `${event.description.substring(0, 50)}...`
                                                                            : event.description
                                                                        }
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                                                        isToday ? 'bg-red-100 text-red-700' :
                                                                        isTomorrow ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-gray-100 text-gray-700'
                                                                    }`}>
                                                                        {dateDisplay}
                                                                    </span>
                                                                    {event.event_time && (
                                                                        <span className="text-gray-500 text-xs">
                                                                            {event.event_time}
                                                                        </span>
                                                                    )}
                                                                    {event.priority && event.priority !== 'medium' && (
                                                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                                                            event.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                                            event.priority === 'low' ? 'bg-green-100 text-green-700' :
                                                                            'bg-blue-100 text-blue-700'
                                                                        }`}>
                                                                            {event.priority}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300">
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {otherEvents.length > 8 && (
                                                <div className="text-center mt-4">
                                                    <button 
                                                        onClick={() => setViewMode('list')}
                                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline transition-colors duration-300"
                                                    >
                                                        View all {otherEvents.length} upcoming events →
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                            
                            {/* Empty State */}
                            {priorityUpcomingEvents.length === 0 && allEvents.filter(event => {
                                if (event.is_completed) return false;
                                const eventDate = new Date(event.event_date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                eventDate.setHours(0, 0, 0, 0);
                                return eventDate >= today;
                            }).length === 0 && (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-6">🎉</div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                                        All caught up!
                                    </h3>
                                    <p className="text-gray-600 text-lg mb-6">
                                        No upcoming events. Add your first event to get started!
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : viewMode === 'calendar' ? (
                        <CalendarView
                            currentDate={currentDate}
                            groupedEvents={groupedEvents}
                            onDateClick={handleDateClick}
                            onEventClick={handleEventClick}
                            onMonthChange={handleMonthChange}
                            onEventUpdated={handleEventUpdated}
                            onEventDeleted={handleEventDelete}
                        />
                    ) : (
                        <EventList
                            events={allEvents}
                            onEventClick={handleEventClick}
                            onEventUpdated={handleEventUpdated}
                            onEventDeleted={handleEventDelete}
                        />
                    )}
                </div>

                {/* Add Event Modal */}
                {showAddForm && (
                    <AddEvent
                        selectedDate={selectedDate}
                        onEventAdded={handleEventAdded}
                        onCancel={() => {
                            setShowAddForm(false);
                            setSelectedDate(null);
                        }}
                    />
                )}

                {/* Event View Modal */}
                {selectedEvent && !showEditModal && (
                    <EventViewModal
                        event={selectedEvent}
                        onEdit={handleEditEvent}
                        onEventUpdated={handleEventUpdated}
                        onEventDeleted={handleEventDelete}
                        onClose={handleCloseViewModal}
                    />
                )}

                {/* Event Edit Modal */}
                {selectedEvent && showEditModal && (
                    <EventModal
                        event={selectedEvent}
                        onEventUpdated={handleEventUpdated}
                        onEventDeleted={handleEventDelete}
                        onClose={handleCloseEditModal}
                    />
                )}
            </div>
        </div>
    );
}

export default Calendar;