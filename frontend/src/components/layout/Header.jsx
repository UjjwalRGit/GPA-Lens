import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import authUtils from '../../utils/auth.js';
import EmailPreferences from '../settings/EmailPreferences.jsx';
import DeleteAccount from '../settings/DeleteAccount.jsx';
import AccountSettings from '../settings/AccountSettings.jsx';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = authUtils.isAuthenticated();
    const user = authUtils.getCurrentUser();
    const [showMenu, setShowMenu] = useState(false);
    const [showEmailPreferences, setShowPreferences] = useState(false);
    const [showDeleteAccount, setShowDelete] = useState(false);
    const [showAccountSettings, setShowAccountSettings] = useState(false);

    function handleLogout() {
        authUtils.logout();
        navigate('/login');
        setShowMenu(false);
    }

    function handleMenuToggle() {
        setShowMenu(!showMenu);
    }

    function handleAccountSettingsClick() {
        setShowAccountSettings(true);
        setShowMenu(false);
    }

    function handleSettingsClick() {
        setShowPreferences(true);
        setShowMenu(false);
    }

    function handleDeleteAccountClick() {
        setShowDelete(true);
        setShowMenu(false);
    }

    function handleOverlayClick() {
        setShowMenu(false);
    }

    return (
        <>
            <header className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white py-6 shadow-2xl sticky top-0 z-50 backdrop-blur-sm border-b border-purple-500/20">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    {/* Logo/Brand */}
                    <Link 
                        to='/dashboard' 
                        className="text-3xl font-extrabold text-transparent bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text no-underline flex items-center gap-3 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 font-mono tracking-tight"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            📊
                        </div>
                        GPA Lens
                    </Link>

                    <nav className="flex items-center">
                        {isAuthenticated ? (
                            <div className="flex items-center gap-6 relative">
                                {/* Desktop Navigation */}
                                <div className="hidden md:flex items-center gap-2">
                                    <Link
                                        to='/dashboard'
                                        className={`text-purple-100 no-underline px-5 py-3 rounded-xl font-semibold transition-all duration-300 relative hover:text-white hover:bg-purple-700/40 hover:shadow-lg hover:shadow-purple-500/25 font-sans tracking-wide ${
                                            location.pathname === '/dashboard' 
                                                ? 'text-white bg-purple-600/50 shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/50' 
                                                : ''
                                        }`}
                                    >
                                        📈 Dashboard
                                    </Link>
                                    <Link
                                        to='/calendar'
                                        className={`text-purple-100 no-underline px-5 py-3 rounded-xl font-semibold transition-all duration-300 relative hover:text-white hover:bg-purple-700/40 hover:shadow-lg hover:shadow-purple-500/25 font-sans tracking-wide ${
                                            location.pathname === '/calendar' 
                                                ? 'text-white bg-purple-600/50 shadow-lg shadow-purple-500/30 ring-2 ring-purple-400/50' 
                                                : ''
                                        }`}
                                    >
                                        📅 Calendar
                                    </Link>
                                </div>
                                
                                {/* Welcome Message */}
                                <span className="hidden lg:flex text-purple-200 font-medium items-center gap-2 bg-purple-800/30 px-4 py-2 rounded-lg border border-purple-500/30 font-sans">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {user?.username?.charAt(0)?.toUpperCase() || '👤'}
                                    </div>
                                    Welcome, <span className="text-purple-100 font-semibold">{user?.username}</span>!
                                </span>

                                {/* Profile Menu Button */}
                                <div className="relative">
                                    <button
                                        onClick={handleMenuToggle}
                                        className="flex items-center gap-2 bg-purple-700/50 hover:bg-purple-600/60 px-4 py-3 rounded-xl transition-all duration-300 font-semibold border border-purple-500/40 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/25 font-sans"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {user?.username?.charAt(0)?.toUpperCase() || '⚙️'}
                                        </div>
                                        <span className="hidden sm:block text-purple-100">Settings</span>
                                        <svg className={`w-4 h-4 text-purple-200 transition-transform duration-200 ${showMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {showMenu && (
                                        <div className="absolute right-0 mt-3 w-64 bg-purple-900/95 backdrop-blur-lg border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-900/50 py-2 z-50">
                                            {/* Mobile Navigation Links */}
                                            <div className="md:hidden border-b border-purple-500/30 pb-2 mb-2">
                                                <Link
                                                    to='/dashboard'
                                                    onClick={() => setShowMenu(false)}
                                                    className={`flex items-center gap-3 px-4 py-3 text-purple-100 no-underline hover:bg-purple-700/40 hover:text-white transition-all duration-200 font-medium font-sans ${
                                                        location.pathname === '/dashboard' ? 'bg-purple-700/50 text-white' : ''
                                                    }`}
                                                >
                                                    <span className="text-lg">📈</span>
                                                    Dashboard
                                                </Link>
                                                <Link
                                                    to='/calendar'
                                                    onClick={() => setShowMenu(false)}
                                                    className={`flex items-center gap-3 px-4 py-3 text-purple-100 no-underline hover:bg-purple-700/40 hover:text-white transition-all duration-200 font-medium font-sans ${
                                                        location.pathname === '/calendar' ? 'bg-purple-700/50 text-white' : ''
                                                    }`}
                                                >
                                                    <span className="text-lg">📅</span>
                                                    Calendar
                                                </Link>
                                            </div>

                                            {/* Settings Options */}
                                            <button
                                                onClick={handleAccountSettingsClick}
                                                className="flex items-center gap-3 px-4 py-3 text-purple-100 hover:bg-purple-700/40 hover:text-white transition-all duration-200 w-full text-left font-medium font-sans"
                                            >
                                                <span className="text-lg">⚙️</span>
                                                Account Settings
                                            </button>
                                            <button
                                                onClick={handleSettingsClick}
                                                className="flex items-center gap-3 px-4 py-3 text-purple-100 hover:bg-purple-700/40 hover:text-white transition-all duration-200 w-full text-left font-medium font-sans"
                                            >
                                                <span className="text-lg">📧</span>
                                                Email Preferences
                                            </button>
                                            <button
                                                onClick={handleDeleteAccountClick}
                                                className="flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-900/40 hover:text-red-200 transition-all duration-200 w-full text-left font-medium font-sans"
                                            >
                                                <span className="text-lg">🗑️</span>
                                                Delete Account
                                            </button>
                                            
                                            <div className="border-t border-purple-500/30 mt-2 pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 px-4 py-3 text-purple-200 hover:bg-purple-700/40 hover:text-white transition-all duration-200 w-full text-left font-medium font-sans"
                                                >
                                                    <span className="text-lg">🚪</span>
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Menu Overlay */}
                                {showMenu && (
                                    <div
                                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                                        onClick={handleOverlayClick}
                                    />
                                )}
                            </div>
                        ) : ( 
                            <div className="flex items-center gap-4">
                                <Link 
                                    to='/login' 
                                    className="px-6 py-3 border-2 border-purple-300/60 text-purple-100 no-underline rounded-xl font-semibold transition-all duration-300 hover:bg-purple-700/30 hover:border-purple-200 hover:text-white hover:shadow-lg hover:shadow-purple-500/25 font-sans tracking-wide"
                                >
                                    Login
                                </Link>
                                <Link 
                                    to='/register' 
                                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white no-underline rounded-xl font-bold border-2 border-transparent transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/40 hover:from-purple-500 hover:to-pink-500 font-sans tracking-wide"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {/* Modal Components - Now outside the header */}
            {showAccountSettings && (
                <AccountSettings onClose={() => setShowAccountSettings(false)} />
            )}

            {showEmailPreferences && (
                <EmailPreferences onClose={() => setShowPreferences(false)} />
            )}

            {showDeleteAccount && (
                <DeleteAccount onClose={() => setShowDelete(false)} />
            )}
        </>
    )
}

export default Header;