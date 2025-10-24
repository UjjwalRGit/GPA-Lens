import { useState, useEffect } from 'react';
import { calendarService } from '../../services/calendar-service.js';
import CalendarView from './CalendarView.jsx';
import EventList from './EventList.jsx';
import AddEvent from './AddEvent.jsx';
import EventModal from './EventModal.jsx';
import EventViewModal from './EventViewModal.jsx';
import UpcomingEvents from './UpcomingEvents.jsx';
import { useGuestMode } from '../../contexts/GuestModeContext.jsx';

function Calendar() {
    const { isGuestMode, guestData } = useGuestMode();
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
    }, [isGuestMode, guestData]);

    // Update monthly view when currentDate changes or allEvents change
    useEffect(() => {
        if (allEvents.length >= 0) {
            updateMonthlyView();
        }
    }, [currentDate, allEvents]);

    async function loadAllEvents() {
        try {
            setLoading(true);
            
            if (isGuestMode) {
                // Load from guest storage
                const guestEvents = guestData.events || [];
                setAllEvents(guestEvents);
            } else {
                // Load from API
                const response = await calendarService.getEvents();
                setAllEvents(response.data);
            }
        } catch (error) {
            setError('Failed to load all events');
            console.error('Error loading all events:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadUpcomingEvents() {
        try {
            if (isGuestMode) {
                // Calculate upcoming events from guest data
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const upcoming = (guestData.events || [])
                    .filter(event => {
                        if (event.is_completed) return false;
                        const eventDate = new Date(event.event_date);
                        return eventDate >= today;
                    })
                    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
                    .slice(0, 10);
                
                setUpcomingEvents(upcoming);
            } else {
                // Load from API
                const response = await calendarService.getUpcomingEvents(10);
                setUpcomingEvents(response.data);
            }
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
    }

    function handleMonthChange(increment) {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setMonth(prevDate.getMonth() + increment);
            return newDate;
        });
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-blue-200/50">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="text-xl font-semibold text-blue-800">Loading your calendar...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                {/* Guest Mode Banner */}
                {isGuestMode && (
                    <div className="mb-6 bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">📅</span>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-yellow-800 mb-2">Guest Calendar Mode</h3>
                                <p className="text-yellow-700 font-medium">
                                    Your events are temporary and will be cleared when you close your browser.
                                </p>
                            </div>
                            <a 
                                href="/register" 
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 no-underline"
                            >
                                Sign Up to Save
                            </a>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Your Calendar
                    </h1>
                    <p className="text-lg text-gray-600 font-medium">
                        Stay organized and never miss an important date
                    </p>
                </div>

                {error && (
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 text-red-800 px-6 py-4 rounded-2xl mb-6 flex items-center gap-4 shadow-lg">
                        <span className="text-2xl">⚠️</span>
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <button
                        onClick={() => setViewMode('dashboard')}
                        className={`px-6 py-3 font-bold rounded-2xl transition-all duration-300 ${
                            viewMode === 'dashboard'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl ring-4 ring-blue-200'
                                : 'bg-white/80 text-blue-700 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 shadow-lg'
                        }`}
                    >
                        🏠 Dashboard
                    </button>
                    <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-6 py-3 font-bold rounded-2xl transition-all duration-300 ${
                            viewMode === 'calendar'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl ring-4 ring-blue-200'
                                : 'bg-white/80 text-blue-700 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 shadow-lg'
                        }`}
                    >
                        📅 Calendar
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-6 py-3 font-bold rounded-2xl transition-all duration-300 ${
                            viewMode === 'list'
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl ring-4 ring-blue-200'
                                : 'bg-white/80 text-blue-700 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 shadow-lg'
                        }`}
                    >
                        📋 All Events
                    </button>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    >
                        ➕ Add Event
                    </button>
                </div>

                {/* Content */}
                <div className="mb-8">
                    {viewMode === 'dashboard' ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Upcoming Events Section */}
                            {(() => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                // Priority events (today and tomorrow)
                                const priorityUpcomingEvents = allEvents.filter(event => {
                                    if (event.is_completed) return false;
                                    const eventDate = new Date(event.event_date);
                                    eventDate.setHours(0, 0, 0, 0);
                                    const diffTime = eventDate - today;
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return diffDays >= 0 && diffDays <= 1;
                                });

                                // Other upcoming events
                                const otherEvents = allEvents.filter(event => {
                                    if (event.is_completed) return false;
                                    const eventDate = new Date(event.event_date);
                                    eventDate.setHours(0, 0, 0, 0);
                                    const diffTime = eventDate - today;
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    return diffDays > 1;
                                }).sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

                                return (
                                    <div className="lg:col-span-3">
                                        {/* Priority Events */}
                                        {priorityUpcomingEvents.length > 0 && (
                                            <div className="mb-6">
                                                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                    <span className="text-3xl">🔥</span>
                                                    Priority Events
                                                </h2>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {priorityUpcomingEvents.map(event => {
                                                        const eventDate = new Date(event.event_date);
                                                        const isToday = eventDate.toDateString() === today.toDateString();
                                                        const tomorrow = new Date(today);
                                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                                        const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();

                                                        return (
                                                            <div
                                                                key={event.id}
                                                                onClick={() => handleEventClick(event)}
                                                                className={`p-6 rounded-2xl border-2 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                                                                    isToday 
                                                                        ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300 hover:border-red-400' 
                                                                        : 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300 hover:border-orange-400'
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <h3 className="text-xl font-bold text-gray-800 flex-1">{event.title}</h3>
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                                        isToday ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                                                                    }`}>
                                                                        {isToday ? 'TODAY' : 'TOMORROW'}
                                                                    </span>
                                                                </div>
                                                                {event.description && (
                                                                    <p className="text-gray-700 mb-3">
                                                                        {event.description.length > 100
                                                                            ? `${event.description.substring(0, 100)}...`
                                                                            : event.description
                                                                        }
                                                                    </p>
                                                                )}
                                                                <div className="flex flex-wrap gap-2">
                                                                    {event.event_time && (
                                                                        <span className="px-3 py-1 bg-white/70 rounded-lg text-sm font-medium text-gray-700">
                                                                            🕐 {event.event_time}
                                                                        </span>
                                                                    )}
                                                                    {event.event_type && (
                                                                        <span className="px-3 py-1 bg-white/70 rounded-lg text-sm font-medium text-gray-700 capitalize">
                                                                            {event.event_type.replace('_', ' ')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Other Upcoming Events */}
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                <span className="text-3xl">📅</span>
                                                Upcoming Events
                                            </h2>
                                            {otherEvents.slice(0, 8).map(event => {
                                                const eventDate = new Date(event.event_date);
                                                const isToday = eventDate.toDateString() === today.toDateString();
                                                const tomorrow = new Date(today);
                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                const isTomorrow = eventDate.toDateString() === tomorrow.toDateString();

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
                                                        className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group mb-3"
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
                            {allEvents.filter(event => {
                                if (event.is_completed) return false;
                                const eventDate = new Date(event.event_date);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                eventDate.setHours(0, 0, 0, 0);
                                return eventDate >= today;
                            }).length === 0 && (
                                <div className="lg:col-span-3 text-center py-16">
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