import { createContext, useContext, useState, useEffect } from 'react';

const GuestModeContext = createContext();

export function useGuestMode() {
    const context = useContext(GuestModeContext);
    if (!context) {
        throw new Error('useGuestMode must be used within a GuestModeProvider');
    }
    return context;
}

export function GuestModeProvider({ children }) {
    const [isGuestMode, setIsGuestMode] = useState(false);
    const [guestData, setGuestData] = useState({
        classes: [],
        events: []
    });

    // Initialize guest mode from sessionStorage on mount
    useEffect(() => {
        const guestMode = sessionStorage.getItem('guestMode');
        if (guestMode === 'true') {
            setIsGuestMode(true);
            // Load guest data from sessionStorage
            const savedData = sessionStorage.getItem('guestData');
            if (savedData) {
                try {
                    setGuestData(JSON.parse(savedData));
                } catch (error) {
                    console.error('Error loading guest data:', error);
                }
            }
        }
    }, []);

    // Save guest data to sessionStorage whenever it changes
    useEffect(() => {
        if (isGuestMode) {
            sessionStorage.setItem('guestData', JSON.stringify(guestData));
        }
    }, [guestData, isGuestMode]);

    function enableGuestMode() {
        setIsGuestMode(true);
        sessionStorage.setItem('guestMode', 'true');
        sessionStorage.setItem('guestData', JSON.stringify(guestData));
    }

    function exitGuestMode() {
        setIsGuestMode(false);
        setGuestData({ classes: [], events: [] });
        sessionStorage.removeItem('guestMode');
        sessionStorage.removeItem('guestData');
    }

    // Guest data management functions
    function addGuestClass(classData) {
        setGuestData(prev => ({
            ...prev,
            classes: [...prev.classes, { ...classData, id: Date.now().toString() }]
        }));
    }

    function updateGuestClass(classId, updatedData) {
        setGuestData(prev => ({
            ...prev,
            classes: prev.classes.map(c =>
                c.id === classId ? { ...c, ...updatedData } : c
            )
        }));
    }

    function deleteGuestClass(classId) {
        setGuestData(prev => ({
            ...prev,
            classes: prev.classes.filter(c => c.id !== classId)
        }));
    }

    function addGuestEvent(eventData) {
        setGuestData(prev => ({
            ...prev,
            events: [...prev.events, { ...eventData, id: Date.now().toString() }]
        }));
    }

    function updateGuestEvent(eventId, updatedData) {
        setGuestData(prev => ({
            ...prev,
            events: prev.events.map(e =>
                e.id === eventId ? { ...e, ...updatedData } : e
            )
        }));
    }

    function deleteGuestEvent(eventId) {
        setGuestData(prev => ({
            ...prev,
            events: prev.events.filter(e => e.id !== eventId)
        }));
    }

    const value = {
        isGuestMode,
        guestData,
        enableGuestMode,
        exitGuestMode,
        addGuestClass,
        updateGuestClass,
        deleteGuestClass,
        addGuestEvent,
        updateGuestEvent,
        deleteGuestEvent
    };

    return (
        <GuestModeContext.Provider value={value}>
            {children}
        </GuestModeContext.Provider>
    )
}