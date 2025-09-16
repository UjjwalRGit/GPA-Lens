import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountService } from '../../services/account-service.js';
import authUtils from '../../utils/auth.js';

function DeleteAccount({ onClose }) {
    const [step, setStep] = useState(1); // 1: info, 2: confirm, 3: password
    const [accountInfo, setAccountInfo] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadAccountInfo();
    }, []);

    async function loadAccountInfo() {
        try {
            setLoading(true);
            const response = await accountService.getDeletionInfo();
            setAccountInfo(response.data);
        } catch (error) {
            setError('Failed to load account information');
            console.error('Error loading account info:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleDeleteAccount() {
        try {
            setDeleting(true);
            setError('');

            await accountService.deleteAccount(confirmPassword);

            // Clear auth data
            authUtils.logout();

            // Show success message briefly before redirect
            alert('Account deleted successfully. You will be redirected to the login page.');
            
            // Redirect to login
            navigate('/login');
            
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to delete account');
            setDeleting(false);
        }
    }

    function handleNextStep() {
        if (step === 1) {
            setStep(2);
        } else if (step === 2) {
            if (confirmText.toLowerCase() === 'delete my account') {
                setStep(3);
            } else {
                setError('Please type "delete my account" exactly as shown');
            }
        } else if (step === 3) {
            if (!confirmPassword.trim()) {
                setError('Please enter your password');
                return;
            }
            handleDeleteAccount();
        }
    }

    function handlePrevStep() {
        if (step > 1) {
            setStep(step - 1);
            setError('');
        }
    }

    if (loading) {
        return (
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex justify-center items-center z-50 p-5">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-red-200/50">
                    <div className="flex items-center justify-center text-xl text-red-700 animate-pulse font-medium">
                        ⏳ Loading account information...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/80 flex justify-center items-center z-50 p-5" onClick={onClose}>
            <div 
                className="bg-white/95 backdrop-blur-xl border-2 border-red-200/50 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white p-8 rounded-t-3xl flex justify-between items-center">
                    <h3 className="text-3xl font-black m-0 flex items-center gap-4">
                        🗑️ Delete Account
                    </h3>
                    <button
                        onClick={onClose}
                        className="bg-white/20 border-0 text-white w-10 h-10 rounded-full text-lg cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-white/30 hover:scale-110 font-bold"
                        disabled={deleting}
                    >×</button>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 text-red-800 px-6 py-4 rounded-2xl mb-8 flex items-center gap-4 shadow-lg">
                            <span className="text-2xl">⚠️</span>
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    {/* Step 1: Account Info */}
                    {step === 1 && accountInfo && (
                        <div className="space-y-8">
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-8 shadow-lg">
                                <h4 className="text-red-700 text-2xl font-black mb-4 flex items-center gap-3">
                                    ⚠️ Warning: This action cannot be undone!
                                </h4>
                                <p className="text-red-600 leading-relaxed font-medium text-lg">
                                    Deleting your account will permanently remove all of your data from GPA Lens.
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-purple-200 shadow-lg">
                                <h4 className="text-purple-700 text-2xl font-bold mb-6 flex items-center gap-3">
                                    📊 Your Account Summary
                                </h4>
                                <div className="space-y-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-purple-600 mb-2 text-lg">Username:</span>
                                        <span className="font-bold text-purple-800 break-words text-xl">{accountInfo.user.username}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-purple-600 mb-2 text-lg">Email:</span>
                                        <span className="font-bold text-purple-800 break-words break-all text-xl">{accountInfo.user.email}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-purple-600 mb-2 text-lg">Member since:</span>
                                        <span className="font-bold text-purple-800 text-xl">
                                            {new Date(accountInfo.user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-300 shadow-lg">
                                <h4 className="text-orange-700 text-2xl font-bold mb-6 flex items-center gap-3">
                                    🗂️ Data to be permanently deleted:
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-6 p-4 bg-white rounded-xl border-2 border-yellow-200 shadow-md">
                                        <span className="text-3xl">📚</span>
                                        <span className="text-gray-800 font-bold text-lg">
                                            <strong className="text-orange-700 text-xl">{accountInfo.dataToDelete.classes}</strong> classes and grades
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 p-4 bg-white rounded-xl border-2 border-yellow-200 shadow-md">
                                        <span className="text-3xl">📅</span>
                                        <span className="text-gray-800 font-bold text-lg">
                                            <strong className="text-orange-700 text-xl">{accountInfo.dataToDelete.events}</strong> calendar events
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 p-4 bg-white rounded-xl border-2 border-yellow-200 shadow-md">
                                        <span className="text-3xl">⚙️</span>
                                        <span className="text-gray-800 font-bold text-lg">
                                            All account settings and preferences
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 p-4 bg-white rounded-xl border-2 border-yellow-200 shadow-md">
                                        <span className="text-3xl">📧</span>
                                        <span className="text-gray-800 font-bold text-lg">
                                            Email notification subscriptions
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300 shadow-lg">
                                <h4 className="text-green-700 text-2xl font-bold mb-6 flex items-center gap-3">
                                    💡 Consider these alternatives:
                                </h4>
                                <ul className="space-y-3 text-green-700 font-medium text-lg">
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 mt-1 font-bold">•</span>
                                        Turn off email notifications in settings instead
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 mt-1 font-bold">•</span>
                                        Export your data first (contact support)
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 mt-1 font-bold">•</span>
                                        Take a break and come back later
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Confirmation */}
                    {step === 2 && (
                        <div className="text-center space-y-8">
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-8 shadow-lg">
                                <h4 className="text-red-700 text-2xl font-black mb-4">⚠️ Final Warning</h4>
                                <p className="text-red-600 leading-relaxed text-xl font-medium">
                                    This action will <strong>permanently delete</strong> your account and all associated data. This cannot be undone.
                                </p>
                            </div>

                            <div>
                                <label className="block mb-6 text-purple-800 font-black text-xl leading-relaxed">
                                    To confirm, please type: <strong className="text-red-600">"delete my account"</strong>
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="Type: delete my account"
                                    className="w-full p-6 border-2 border-red-300 rounded-2xl text-xl text-center bg-red-50/50 transition-all duration-300 focus:outline-none focus:border-red-500 focus:shadow-lg focus:shadow-red-200 text-red-900 font-bold placeholder-red-400"
                                    disabled={deleting}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Password */}
                    {step === 3 && (
                        <div className="text-center space-y-8">
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl p-8 shadow-lg">
                                <h4 className="text-red-700 text-2xl font-black mb-4 flex items-center justify-center gap-3">
                                    🔒 Enter Your Password
                                </h4>
                                <p className="text-red-600 leading-relaxed font-medium text-lg">
                                    As a final security measure, please enter your current password to confirm account deletion.
                                </p>
                            </div>

                            <div>
                                <label className="block mb-6 text-purple-800 font-black text-xl">Current Password:</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Enter your current password"
                                    className="w-full p-6 border-2 border-red-300 rounded-2xl text-xl text-center bg-red-50/50 transition-all duration-300 focus:outline-none focus:border-red-500 focus:shadow-lg focus:shadow-red-200 text-red-900 font-bold placeholder-red-400"
                                    disabled={deleting}
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-8 border-t-2 border-red-200/50 bg-gradient-to-r from-red-50 to-pink-50 rounded-b-3xl gap-6">
                    <div className="text-purple-700 font-bold text-lg">
                        Step {step} of 3
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {step > 1 && (
                            <button
                                onClick={handlePrevStep}
                                className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:from-gray-600 hover:to-gray-700 hover:shadow-xl transform hover:-translate-y-1"
                                disabled={deleting}
                            >
                                ← Back
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="px-8 py-4 bg-white text-purple-700 border-2 border-purple-200 font-bold rounded-xl shadow-lg transition-all duration-300 hover:border-purple-400 hover:text-purple-800 hover:bg-purple-50"
                            disabled={deleting}
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleNextStep}
                            className={`px-8 py-4 font-bold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 ${
                                step === 3 
                                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600' 
                                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                            }`}
                            disabled={deleting || (step === 2 && confirmText.toLowerCase() !== 'delete my account')}
                        >
                            {deleting ? (
                                <>
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Deleting...
                                </>
                            ) : step === 1 ? (
                                'Continue →'
                            ) : step === 2 ? (
                                'Continue →'
                            ) : (
                                '🗑️ Delete Account Forever'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DeleteAccount;