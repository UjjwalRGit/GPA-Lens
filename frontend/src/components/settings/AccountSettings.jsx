import { useState, useEffect } from 'react';
import { accountService } from '../../services/account-service.js';

function AccountSettings({ onClose }) {
    const [accountInfo, setAccountInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeSection, setActiveSection] = useState('overview');

    // Form states
    const [usernameForm, setUsernameForm] = useState({
        newUsername: '',
        confirmPassword: '',
        loading: false,
        error: '',
        success: ''
    });

    const [emailForm, setEmailForm] = useState({
        newEmail: '',
        confirmPassword: '',
        loading: false,
        error: '',
        success: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        loading: false,
        error: '',
        success: ''
    });

    const [createPasswordForm, setCreatePasswordForm] = useState({
        password: '',
        confirmPassword: '',
        loading: false,
        error: '',
        success: ''
    });

    const [usernameAvailable, setUsernameAvailable] = useState(null);
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    useEffect(() => {
        loadAccountInfo();
    }, []);

    async function loadAccountInfo() {
        try {
            setLoading(true);
            const response = await accountService.getAccountInfo();
            setAccountInfo(response.data);
        } catch (error) {
            setError('Failed to load account information');
            console.error('Error loading account info:', error);
        } finally {
            setLoading(false);
        }
    }

    // Debounced availability checking
    useEffect(() => {
        if (usernameForm.newUsername && usernameForm.newUsername !== accountInfo?.username) {
            const timer = setTimeout(async () => {
                try {
                    setCheckingAvailability(true);
                    const response = await accountService.checkUsernameAvailability(usernameForm.newUsername);
                    setUsernameAvailable(response.data.available);
                } catch (error) {
                    setUsernameAvailable(null);
                } finally {
                    setCheckingAvailability(false);
                }
            }, 500);

            return () => clearTimeout(timer);
        } else {
            setUsernameAvailable(null);
        }
    }, [usernameForm.newUsername, accountInfo?.username]);

    useEffect(() => {
        if (emailForm.newEmail && emailForm.newEmail !== accountInfo?.email) {
            const timer = setTimeout(async () => {
                try {
                    setCheckingAvailability(true);
                    const response = await accountService.checkEmailAvailability(emailForm.newEmail);
                    setEmailAvailable(response.data.available);
                } catch (error) {
                    setEmailAvailable(null);
                } finally {
                    setCheckingAvailability(false);
                }
            }, 500);

            return () => clearTimeout(timer);
        } else {
            setEmailAvailable(null);
        }
    }, [emailForm.newEmail, accountInfo?.email]);

    async function handleUsernameUpdate(e) {
        e.preventDefault();
        setUsernameForm(prev => ({ ...prev, loading: true, error: '', success: '' }));

        try {
            const response = await accountService.updateUsername(
                usernameForm.newUsername,
                usernameForm.confirmPassword
            );
            
            setUsernameForm(prev => ({
                ...prev,
                success: 'Username updated successfully!',
                newUsername: '',
                confirmPassword: ''
            }));
            
            // Update account info
            await loadAccountInfo();
            
        } catch (error) {
            setUsernameForm(prev => ({
                ...prev,
                error: error.response?.data?.error || 'Failed to update username'
            }));
        } finally {
            setUsernameForm(prev => ({ ...prev, loading: false }));
        }
    }

    async function handleEmailUpdate(e) {
        e.preventDefault();
        setEmailForm(prev => ({ ...prev, loading: true, error: '', success: '' }));

        try {
            const response = await accountService.updateEmail(
                emailForm.newEmail,
                emailForm.confirmPassword
            );
            
            setEmailForm(prev => ({
                ...prev,
                success: 'Email updated successfully!',
                newEmail: '',
                confirmPassword: ''
            }));
            
            // Update account info
            await loadAccountInfo();
            
        } catch (error) {
            setEmailForm(prev => ({
                ...prev,
                error: error.response?.data?.error || 'Failed to update email'
            }));
        } finally {
            setEmailForm(prev => ({ ...prev, loading: false }));
        }
    }

    async function handlePasswordUpdate(e) {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            setPasswordForm(prev => ({
                ...prev,
                error: 'New passwords do not match'
            }));
            return;
        }

        setPasswordForm(prev => ({ ...prev, loading: true, error: '', success: '' }));

        try {
            await accountService.updatePassword(
                passwordForm.currentPassword,
                passwordForm.newPassword
            );
            
            setPasswordForm(prev => ({
                ...prev,
                success: 'Password updated successfully!',
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            }));
            
            // Update account info
            await loadAccountInfo();
            
        } catch (error) {
            setPasswordForm(prev => ({
                ...prev,
                error: error.response?.data?.error || 'Failed to update password'
            }));
        } finally {
            setPasswordForm(prev => ({ ...prev, loading: false }));
        }
    }

    async function handleCreatePassword(e) {
        e.preventDefault();
        
        if (createPasswordForm.password !== createPasswordForm.confirmPassword) {
            setCreatePasswordForm(prev => ({
                ...prev,
                error: 'Passwords do not match'
            }));
            return;
        }

        setCreatePasswordForm(prev => ({ ...prev, loading: true, error: '', success: '' }));

        try {
            await accountService.createPassword(createPasswordForm.password);
            
            setCreatePasswordForm(prev => ({
                ...prev,
                success: 'Password created successfully!',
                password: '',
                confirmPassword: ''
            }));
            
            // Update account info
            await loadAccountInfo();
            
        } catch (error) {
            setCreatePasswordForm(prev => ({
                ...prev,
                error: error.response?.data?.error || 'Failed to create password'
            }));
        } finally {
            setCreatePasswordForm(prev => ({ ...prev, loading: false }));
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatCooldownDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-2 sm:p-4 md:p-5">
                <div className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl p-6 sm:p-8 border border-purple-200/50 max-w-md w-full">
                    <div className="flex items-center justify-center text-lg sm:text-xl text-purple-700 animate-pulse font-medium">
                        Loading account settings...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-2 sm:p-4 md:p-5" onClick={onClose}>
            <div 
                className="bg-white/95 backdrop-blur-xl border-2 border-purple-200/50 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-4xl lg:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 text-white p-4 sm:p-6 md:p-8 rounded-t-xl sm:rounded-t-2xl md:rounded-t-3xl flex justify-between items-center flex-shrink-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black m-0 flex items-center gap-2 sm:gap-4">
                       ⚙️ Account Settings
                    </h3>
                    <button
                        onClick={onClose}
                        className="bg-white/20 border-0 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full text-base sm:text-lg cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-white/30 hover:scale-110 font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="flex flex-col md:flex-row flex-1 min-h-0">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-1/3 bg-gradient-to-br from-purple-50 to-indigo-50 p-3 sm:p-4 md:p-6 border-b md:border-b-0 md:border-r-2 border-purple-200/50 flex-shrink-0 max-h-48 md:max-h-none overflow-y-auto md:overflow-y-visible">
                        <nav className="space-y-2 sm:space-y-3">
                            <button
                                onClick={() => setActiveSection('overview')}
                                className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-300 font-semibold text-sm sm:text-base ${
                                    activeSection === 'overview' 
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl ring-2 ring-purple-400/50' 
                                        : 'text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200/50'
                                }`}
                            >
                                📊 Account Overview
                            </button>
                            <button
                                onClick={() => setActiveSection('username')}
                                className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-300 font-semibold text-sm sm:text-base ${
                                    activeSection === 'username' 
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl ring-2 ring-purple-400/50' 
                                        : 'text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200/50'
                                }`}
                            >
                                👤 Change Username
                                {accountInfo?.cooldowns?.username && !accountInfo.cooldowns.username.canChange && (
                                    <div className="text-xs text-orange-200 mt-1">
                                        Available in {accountInfo.cooldowns.username.daysRemaining} days
                                    </div>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveSection('email')}
                                className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-300 font-semibold text-sm sm:text-base ${
                                    activeSection === 'email' 
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl ring-2 ring-purple-400/50' 
                                        : 'text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200/50'
                                }`}
                            >
                                📧 Change Email
                                {accountInfo?.cooldowns?.email && !accountInfo.cooldowns.email.canChange && (
                                    <div className="text-xs text-orange-200 mt-1">
                                        Available in {accountInfo.cooldowns.email.daysRemaining} days
                                    </div>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveSection('password')}
                                className={`w-full text-left p-3 sm:p-4 rounded-xl transition-all duration-300 font-semibold text-sm sm:text-base ${
                                    activeSection === 'password' 
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl ring-2 ring-purple-400/50' 
                                        : 'text-purple-700 hover:bg-purple-100 hover:text-purple-800 border border-purple-200/50'
                                }`}
                            >
                                🔒 {accountInfo?.hasPassword ? 'Change Password' : 'Create Password'}
                            </button>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
                        {/* Account Overview */}
                        {activeSection === 'overview' && (
                            <div className="space-y-6 sm:space-y-8">
                                <h4 className="text-xl sm:text-2xl font-black text-purple-800 mb-4 sm:mb-6">Account Information</h4>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-6 md:p-8 rounded-2xl border-2 border-purple-200/50 shadow-lg">
                                        <h5 className="font-bold text-purple-700 mb-4 text-base sm:text-lg">Basic Information</h5>
                                        <div className="space-y-3 sm:space-y-4">
                                            <div>
                                                <span className="text-xs sm:text-sm text-purple-600 font-semibold">Username:</span>
                                                <div className="font-bold text-purple-800 text-sm sm:text-base md:text-lg break-words">{accountInfo?.username}</div>
                                            </div>
                                            <div>
                                                <span className="text-xs sm:text-sm text-purple-600 font-semibold">Email:</span>
                                                <div className="font-bold text-purple-800 break-all text-xs sm:text-sm md:text-base">{accountInfo?.email}</div>
                                            </div>
                                            <div>
                                                <span className="text-xs sm:text-sm text-purple-600 font-semibold">Account Type:</span>
                                                <div className="font-bold text-purple-800 text-sm sm:text-base">
                                                    {accountInfo?.isGoogleUser ? '🟦 Google Account' : '🟣 Standard Account'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 sm:p-6 md:p-8 rounded-2xl border-2 border-purple-200/50 shadow-lg">
                                        <h5 className="font-bold text-purple-700 mb-4 text-base sm:text-lg">Account Status</h5>
                                        <div className="space-y-3 sm:space-y-4">
                                            <div>
                                                <span className="text-xs sm:text-sm text-purple-600 font-semibold">Member Since:</span>
                                                <div className="font-bold text-purple-800 text-sm sm:text-base">
                                                    {formatDate(accountInfo?.created_at)}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs sm:text-sm text-purple-600 font-semibold">Password Status:</span>
                                                <div className={`font-bold text-sm sm:text-base ${accountInfo?.hasPassword ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {accountInfo?.hasPassword ? '✅ Password Set' : '❌ No Password'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Change Cooldowns */}
                                {(accountInfo?.cooldowns?.username || accountInfo?.cooldowns?.email) && (
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-2xl border-2 border-blue-200 shadow-lg">
                                        <h5 className="font-bold text-blue-700 mb-3 text-base sm:text-lg">Change Restrictions</h5>
                                        <div className="space-y-2 text-xs sm:text-sm">
                                            {accountInfo.cooldowns.username && !accountInfo.cooldowns.username.canChange && (
                                                <div className="text-blue-700 font-medium">
                                                    Username can be changed again on {formatCooldownDate(accountInfo.cooldowns.username.nextChangeDate)}
                                                </div>
                                            )}
                                            {accountInfo.cooldowns.email && !accountInfo.cooldowns.email.canChange && (
                                                <div className="text-blue-700 font-medium">
                                                    Email can be changed again on {formatCooldownDate(accountInfo.cooldowns.email.nextChangeDate)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Username Section */}
                        {activeSection === 'username' && (
                            <div className="space-y-6 sm:space-y-8">
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-black text-purple-800 mb-3">Change Username</h4>
                                    <p className="text-purple-600 font-medium text-sm sm:text-base">Current username: <strong className="text-purple-800">{accountInfo?.username}</strong></p>
                                </div>

                                {!accountInfo?.hasPassword ? (
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 p-4 sm:p-6 rounded-2xl shadow-lg">
                                        <p className="text-orange-700 font-bold text-base sm:text-lg mb-4">
                                            You need to create a password before you can change your username.
                                        </p>
                                        <button
                                            onClick={() => setActiveSection('password')}
                                            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                                        >
                                            Create Password First
                                        </button>
                                    </div>
                                ) : !accountInfo?.cooldowns?.username?.canChange ? (
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 p-4 sm:p-6 rounded-2xl shadow-lg">
                                        <p className="text-yellow-700 font-bold text-base sm:text-lg">
                                            You can change your username again in {accountInfo.cooldowns.username.daysRemaining} days 
                                            (on {formatCooldownDate(accountInfo.cooldowns.username.nextChangeDate)}).
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleUsernameUpdate} className="bg-gradient-to-br from-purple-50 to-indigo-100 p-4 sm:p-6 md:p-8 rounded-2xl border-2 border-purple-200/50 shadow-lg space-y-4 sm:space-y-6">
                                        {usernameForm.error && (
                                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm sm:text-base">
                                                {usernameForm.error}
                                            </div>
                                        )}
                                        {usernameForm.success && (
                                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl text-sm sm:text-base">
                                                {usernameForm.success}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block mb-3 font-bold text-purple-700 text-sm sm:text-base md:text-lg">
                                                New Username
                                            </label>
                                            <input
                                                type="text"
                                                value={usernameForm.newUsername}
                                                onChange={(e) => setUsernameForm(prev => ({ ...prev, newUsername: e.target.value }))}
                                                className="w-full p-3 sm:p-4 border-2 border-purple-200 rounded-xl text-sm sm:text-base md:text-lg transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 text-purple-900"
                                                placeholder="Enter new username"
                                                required
                                            />
                                            {checkingAvailability && (
                                                <p className="text-purple-500 text-xs sm:text-sm mt-2">Checking availability...</p>
                                            )}
                                            {usernameAvailable === false && (
                                                <p className="text-red-500 text-xs sm:text-sm mt-2">This username is already taken</p>
                                            )}
                                            {usernameAvailable === true && (
                                                <p className="text-green-500 text-xs sm:text-sm mt-2">This username is available!</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-3 font-bold text-purple-700 text-sm sm:text-base md:text-lg">
                                                Confirm Password
                                            </label>
                                            <input
                                                type="password"
                                                value={usernameForm.confirmPassword}
                                                onChange={(e) => setUsernameForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="w-full p-3 sm:p-4 border-2 border-purple-200 rounded-xl text-sm sm:text-base md:text-lg transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 text-purple-900"
                                                placeholder="Enter your password to confirm"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={usernameForm.loading || usernameAvailable === false}
                                            className="w-full p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {usernameForm.loading ? 'Updating...' : 'Update Username'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Email Section */}
                        {activeSection === 'email' && (
                            <div className="space-y-6 sm:space-y-8">
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-black text-purple-800 mb-3">Change Email</h4>
                                    <p className="text-purple-600 font-medium text-sm sm:text-base">Current email: <strong className="text-purple-800 break-all">{accountInfo?.email}</strong></p>
                                </div>

                                {!accountInfo?.hasPassword ? (
                                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 p-4 sm:p-6 rounded-2xl shadow-lg">
                                        <p className="text-orange-700 font-bold text-base sm:text-lg mb-4">
                                            You need to create a password before you can change your email.
                                        </p>
                                        <button
                                            onClick={() => setActiveSection('password')}
                                            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                                        >
                                            Create Password First
                                        </button>
                                    </div>
                                ) : !accountInfo?.cooldowns?.email?.canChange ? (
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 p-4 sm:p-6 rounded-2xl shadow-lg">
                                        <p className="text-yellow-700 font-bold text-base sm:text-lg">
                                            You can change your email again in {accountInfo.cooldowns.email.daysRemaining} days 
                                            (on {formatCooldownDate(accountInfo.cooldowns.email.nextChangeDate)}).
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleEmailUpdate} className="bg-gradient-to-br from-purple-50 to-indigo-100 p-4 sm:p-6 md:p-8 rounded-2xl border-2 border-purple-200/50 shadow-lg space-y-4 sm:space-y-6">
                                        {emailForm.error && (
                                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm sm:text-base">
                                                {emailForm.error}
                                            </div>
                                        )}
                                        {emailForm.success && (
                                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl text-sm sm:text-base">
                                                {emailForm.success}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block mb-3 font-bold text-purple-700 text-sm sm:text-base md:text-lg">
                                                New Email
                                            </label>
                                            <input
                                                type="email"
                                                value={emailForm.newEmail}
                                                onChange={(e) => setEmailForm(prev => ({ ...prev, newEmail: e.target.value }))}
                                                className="w-full p-3 sm:p-4 border-2 border-purple-200 rounded-xl text-sm sm:text-base md:text-lg transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 text-purple-900"
                                                placeholder="Enter new email address"
                                                required
                                            />
                                            {checkingAvailability && (
                                                <p className="text-purple-500 text-xs sm:text-sm mt-2">Checking availability...</p>
                                            )}
                                            {emailAvailable === false && (
                                                <p className="text-red-500 text-xs sm:text-sm mt-2">This email is already in use</p>
                                            )}
                                            {emailAvailable === true && (
                                                <p className="text-green-500 text-xs sm:text-sm mt-2">This email is available!</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block mb-3 font-bold text-purple-700 text-sm sm:text-base md:text-lg">
                                                Confirm Password
                                            </label>
                                            <input
                                                type="password"
                                                value={emailForm.confirmPassword}
                                                onChange={(e) => setEmailForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="w-full p-3 sm:p-4 border-2 border-purple-200 rounded-xl text-sm sm:text-base md:text-lg transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 text-purple-900"
                                                placeholder="Enter your password to confirm"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={emailForm.loading || emailAvailable === false}
                                            className="w-full p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {emailForm.loading ? 'Updating...' : 'Update Email'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {/* Password Section */}
                        {activeSection === 'password' && (
                            <div className="space-y-6 sm:space-y-8">
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-black text-purple-800 mb-3">
                                        {accountInfo?.hasPassword ? 'Change Password' : 'Create Password'}
                                    </h4>
                                    <p className="text-purple-600 font-medium text-sm sm:text-base">
                                        {accountInfo?.hasPassword 
                                            ? 'Update your current password with a new one' 
                                            : 'Create a password to secure your account and enable username/email changes'
                                        }
                                    </p>
                                </div>

                                {accountInfo?.hasPassword ? (
                                    // Change Password Form
                                    <form onSubmit={handlePasswordUpdate} className="bg-gradient-to-br from-purple-50 to-indigo-100 p-4 sm:p-6 md:p-8 rounded-2xl border-2 border-purple-200/50 shadow-lg space-y-4 sm:space-y-6">
                                        {passwordForm.error && (
                                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm sm:text-base">
                                                {passwordForm.error}
                                            </div>
                                        )}
                                        {passwordForm.success && (
                                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl text-sm sm:text-base">
                                                {passwordForm.success}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block mb-3 font-bold text-purple-700 text-sm sm:text-base md:text-lg">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                className="w-full p-3 sm:p-4 border-2 border-purple-200 rounded-xl text-sm sm:text-base md:text-lg transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 text-purple-900"
                                                placeholder="Enter your current password"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-3 font-bold text-purple-700 text-sm sm:text-base md:text-lg">
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="w-full p-3 sm:p-4 border-2 border-purple-200 rounded-xl text-sm sm:text-base md:text-lg transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 text-purple-900"
                                                placeholder="Enter your new password"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block mb-3 font-bold text-purple-700 text-sm sm:text-base md:text-lg">
                                                Confirm New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.confirmNewPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                                                className="w-full p-3 sm:p-4 border-2 border-purple-200 rounded-xl text-sm sm:text-base md:text-lg transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 text-purple-900"
                                                placeholder="Confirm your new password"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={passwordForm.loading}
                                            className="w-full p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                        >
                                            {passwordForm.loading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </form>
                                ) : (
                                    // Create Password Form
                                    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-4 sm:p-6 md:p-8 rounded-2xl border-2 border-purple-200/50 shadow-lg space-y-4 sm:space-y-6">
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border-2 border-blue-200">
                                            <h6 className="font-bold text-blue-700 mb-3 text-sm sm:text-base md:text-lg">Benefits of Creating a Password</h6>
                                            <ul className="space-y-2 text-xs sm:text-sm md:text-base text-blue-700">
                                                <li className="flex items-center gap-3">
                                                    <span className="text-blue-600">•</span>
                                                    Change your username and email address
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <span className="text-blue-600">•</span>
                                                    Enhanced account security
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <span className="text-blue-600">•</span>
                                                    Login with either Google or email/password
                                                </li>
                                            </ul>
                                        </div>

                                        <form onSubmit={handleCreatePassword} className="space-y-4 sm:space-y-6">
                                            {createPasswordForm.error && (
                                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-sm sm:text-base">
                                                    {createPasswordForm.error}
                                                </div>
                                            )}
                                            {createPasswordForm.success && (
                                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl text-sm sm:text-base">
                                                    {createPasswordForm.success}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block mb-3 font-bold text-purple-700 text-sm sm:text-base md:text-lg">
                                                    Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={createPasswordForm.password}
                                                    onChange={(e) => setCreatePasswordForm(prev => ({ ...prev, password: e.target.value }))}
                                                    className="w-full p-3 sm:p-4 border-2 border-purple-200 rounded-xl text-sm sm:text-base md:text-lg transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 text-purple-900"
                                                    placeholder="Enter a secure password"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block mb-3 font-bold text-purple-700 text-sm sm:text-base md:text-lg">
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type="password"
                                                    value={createPasswordForm.confirmPassword}
                                                    onChange={(e) => setCreatePasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                    className="w-full p-3 sm:p-4 border-2 border-purple-200 rounded-xl text-sm sm:text-base md:text-lg transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 text-purple-900"
                                                    placeholder="Confirm your password"
                                                    required
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={createPasswordForm.loading}
                                                className="w-full p-3 sm:p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                            >
                                                {createPasswordForm.loading ? 'Creating...' : 'Create Password'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-3 sm:p-4 border-t border-gray-200 text-center flex-shrink-0">
                    <div className="text-xs sm:text-sm text-gray-600 mb-3">
                        Need help? Check our documentation or contact support.
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:from-gray-600 hover:to-gray-700 hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AccountSettings;