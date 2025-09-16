import { useState, useEffect } from 'react';
import { reminderService } from '../../services/reminder-service.js';

function EmailPreferences({ onClose }) {
    const [preferences, setPreferences] = useState({
        email_reminders: true,
        daily_digest: true
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadPreferences();
    }, []);

    async function loadPreferences() {
        try {
            setLoading(true);
            const response = await reminderService.getPreferences();
            setPreferences(response.data);
        } catch (error) {
            setError('Failed to load email preferences');
            console.error('Error loading preferences:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const cleanPreferences = {
                email_reminders: Boolean(preferences.email_reminders),
                daily_digest: Boolean(preferences.daily_digest)
            };

            await reminderService.updatePreferences(cleanPreferences);
            setSuccess('Email preferences updated successfully');

            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to update email preferences');
        } finally {
            setSaving(false);
        }
    }

    function handleToggleChange(field, event) {
        const isChecked = event.target.checked;
        setPreferences(prev => ({
            ...prev,
            [field]: isChecked
        }));
    }

    if (loading) {
        return (
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 flex justify-center items-center z-50 p-5">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-purple-200/50">
                    <div className="flex items-center justify-center text-xl text-purple-700 animate-pulse font-medium">
                        ⏳ Loading preferences...
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 flex justify-center items-center z-50 p-5" onClick={onClose}>
            <div 
                className="bg-white/95 backdrop-blur-xl border-2 border-purple-200/50 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 text-white p-8 rounded-t-3xl flex justify-between items-center">
                    <h3 className="text-3xl font-black m-0 flex items-center gap-4">
                        ⚙️ Email Preferences
                    </h3>
                    <button
                        onClick={onClose}
                        className="bg-white/20 border-0 text-white w-10 h-10 rounded-full text-lg cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-white/30 hover:scale-110 font-bold"
                    >×</button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 text-red-800 px-6 py-4 rounded-2xl mb-8 flex items-center gap-4 shadow-lg">
                            <span className="text-2xl">⚠️</span>
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}
                    
                    {success && (
                        <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300 text-green-800 px-6 py-4 rounded-2xl mb-8 flex items-center gap-4 shadow-lg">
                            <span className="text-2xl">✅</span>
                            <span className="font-semibold">{success}</span>
                        </div>
                    )}

                    <div className="space-y-8 mb-10">
                        {/* Event Reminders */}
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 transition-all duration-300 hover:border-purple-400 hover:shadow-xl shadow-lg">
                            <div className="flex-1">
                                <h4 className="text-purple-700 mb-4 text-2xl font-bold flex items-center gap-3">
                                    📧 Event Reminders
                                </h4>
                                <p className="text-purple-600 mb-6 leading-relaxed font-medium text-lg">
                                    Receive email reminders for upcoming events based on your reminder settings for each event.
                                </p>
                                <ul className="list-none p-0 m-0 space-y-3">
                                    <li className="text-purple-700 font-medium relative pl-8 before:content-['✓'] before:absolute before:left-0 before:text-green-500 before:font-bold before:text-xl">
                                        Get notified about exams, assignments, and due dates
                                    </li>
                                    <li className="text-purple-700 font-medium relative pl-8 before:content-['✓'] before:absolute before:left-0 before:text-green-500 before:font-bold before:text-xl">
                                        Customizable reminder timing (1-30 days before)
                                    </li>
                                    <li className="text-purple-700 font-medium relative pl-8 before:content-['✓'] before:absolute before:left-0 before:text-green-500 before:font-bold before:text-xl">
                                        Detailed event information in each email
                                    </li>
                                </ul>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={Boolean(preferences.email_reminders)}
                                    onChange={(e) => handleToggleChange('email_reminders', e)}
                                    disabled={saving}
                                    className="sr-only"
                                />
                                <div className={`relative w-16 h-8 rounded-full transition-colors duration-300 shadow-lg ${
                                    preferences.email_reminders 
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                                        : 'bg-gray-300'
                                }`}>
                                    <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-md ${
                                        preferences.email_reminders ? 'translate-x-8' : 'translate-x-0'
                                    }`}></div>
                                </div>
                            </label>
                        </div>

                        {/* Daily Digest */}
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-8 p-8 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 transition-all duration-300 hover:border-purple-400 hover:shadow-xl shadow-lg">
                            <div className="flex-1">
                                <h4 className="text-purple-700 mb-4 text-2xl font-bold flex items-center gap-3">
                                    📊 Daily Digest
                                </h4>
                                <p className="text-purple-600 mb-6 leading-relaxed font-medium text-lg">
                                    Receive a daily summary of your upcoming events each morning at 8:00 AM.
                                </p>
                                <ul className="list-none p-0 m-0 space-y-3">
                                    <li className="text-purple-700 font-medium relative pl-8 before:content-['✓'] before:absolute before:left-0 before:text-green-500 before:font-bold before:text-xl">
                                        Overview of events for the next 7 days
                                    </li>
                                    <li className="text-purple-700 font-medium relative pl-8 before:content-['✓'] before:absolute before:left-0 before:text-green-500 before:font-bold before:text-xl">
                                        Priority indicators and class information
                                    </li>
                                    <li className="text-purple-700 font-medium relative pl-8 before:content-['✓'] before:absolute before:left-0 before:text-green-500 before:font-bold before:text-xl">
                                        Helps you plan your day effectively
                                    </li>
                                </ul>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={Boolean(preferences.daily_digest)}
                                    onChange={(e) => handleToggleChange('daily_digest', e)}
                                    disabled={saving}
                                    className="sr-only"
                                />
                                <div className={`relative w-16 h-8 rounded-full transition-colors duration-300 shadow-lg ${
                                    preferences.daily_digest 
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500' 
                                        : 'bg-gray-300'
                                }`}>
                                    <div className={`absolute top-1 left-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 shadow-md ${
                                        preferences.daily_digest ? 'translate-x-8' : 'translate-x-0'
                                    }`}></div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* How Email Reminders Work */}
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-2xl border-2 border-purple-200 mb-8 shadow-lg">
                        <h4 className="text-purple-700 mb-8 text-2xl font-bold flex items-center gap-3">
                            🔮 How Email Reminders Work
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-2xl border-2 border-purple-200 transition-all duration-300 hover:border-purple-400 hover:-translate-y-1 hover:shadow-xl shadow-lg">
                                <h5 className="text-purple-700 mb-4 text-lg font-bold flex items-center gap-3">
                                    ⏰ Event Reminders
                                </h5>
                                <p className="text-purple-600 font-medium leading-relaxed m-0">
                                    Sent based on the "reminder days" setting for each event. For example, if set to 3 days, you'll get an email 3 days before the event.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl border-2 border-purple-200 transition-all duration-300 hover:border-purple-400 hover:-translate-y-1 hover:shadow-xl shadow-lg">
                                <h5 className="text-purple-700 mb-4 text-lg font-bold flex items-center gap-3">
                                    📅 Daily Digest
                                </h5>
                                <p className="text-purple-600 font-medium leading-relaxed m-0">
                                    Sent every morning at 8:00 AM with a summary of your upcoming events for the next week.
                                </p>
                            </div>
                            <div className="bg-white p-8 rounded-2xl border-2 border-purple-200 transition-all duration-300 hover:border-purple-400 hover:-translate-y-1 hover:shadow-xl shadow-lg">
                                <h5 className="text-purple-700 mb-4 text-lg font-bold flex items-center gap-3">
                                    🎯 Smart Filtering
                                </h5>
                                <p className="text-purple-600 font-medium leading-relaxed m-0">
                                    Only incomplete events are included in reminders. Completed events won't trigger notifications.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Actions */}
                <div className="flex justify-between items-center p-8 border-t-2 border-purple-200/50 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-b-3xl gap-6">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
                    >
                        {saving ? (
                            <>
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            '💾 Save Preferences'
                        )}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-10 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:from-gray-600 hover:to-gray-700 hover:shadow-xl transform hover:-translate-y-1"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EmailPreferences;