// Updated ResetPassword.jsx
import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth-service.js';

function ResetPassword() {
    const [formData, setData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const resetToken = searchParams.get('token');

    function handleChange(e) {
        setData({...formData, [e.target.name]: e.target.value});
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);
        setMessage('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Password does not match the confirm');
            setLoading(false);
            return;
        }

        if (!resetToken) {
            setError('Invalid reset token, request a new password reset');
            setLoading(false);
            return;
        }

        try {
            await authService.resetPassword(resetToken, formData.newPassword);
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 1000)
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to reset password')
        } finally {
            setLoading(false);
        }
    }

    if (!resetToken) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex justify-center items-start pt-8 pb-8 px-6 font-sans">
                <div className="bg-white/90 backdrop-blur-lg p-12 rounded-3xl shadow-2xl w-full max-w-md border border-red-200/50 my-4">
                    <h2 className="text-center mb-8 text-red-600 text-3xl font-black flex items-center justify-center gap-3 tracking-tight">
                        ❌ Invalid Reset Link
                    </h2>
                    <p className="text-center mb-8 text-red-700 leading-relaxed font-medium">
                        This password reset link has expired or is invalid.
                    </p>
                    <div className="space-y-4">
                        <Link 
                            to="/forgot-password"
                            className="block w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-2xl text-center no-underline shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 border border-purple-400/20"
                        >
                            🔄 Request a new reset link
                        </Link>
                        <Link 
                            to="/login"
                            className="block w-full py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl text-center no-underline shadow-xl hover:shadow-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
                        >
                            ← Or go back to login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex justify-center items-start pt-8 pb-8 px-6 font-sans">
            <div className="bg-white/90 backdrop-blur-lg p-12 rounded-3xl shadow-2xl w-full max-w-md border border-purple-200/50 transform hover:shadow-3xl transition-shadow duration-300 my-4">
                <h2 className="text-center mb-8 text-purple-800 text-3xl font-black flex items-center justify-center gap-3 tracking-tight">
                    🔒 Reset Password
                </h2>
                <p className="text-center mb-8 text-purple-700 leading-relaxed font-medium">
                    Enter your new password
                </p>

                {error && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200/70 text-red-700 px-6 py-4 rounded-2xl mb-8 flex items-center gap-4 backdrop-blur-sm">
                        <span className="text-xl">⚠️</span>
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {message && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200/70 text-green-700 px-6 py-4 rounded-2xl mb-8 flex items-center gap-4 backdrop-blur-sm">
                        <span className="text-xl">✅</span>
                        <span className="font-medium">{message}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-3 font-bold text-purple-700 text-lg">
                            New Password:
                        </label>
                        <input 
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            minLength="8"
                            className="w-full p-4 border-2 border-purple-200/70 rounded-2xl text-base transition-all duration-300 bg-purple-50/30 focus:outline-none focus:border-purple-400 focus:bg-white focus:shadow-xl focus:shadow-purple-100/50 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300 backdrop-blur-sm"
                            placeholder="Enter your new password"
                        />
                    </div>

                    <div>
                        <label className="block mb-3 font-bold text-purple-700 text-lg">
                            Confirm Password:
                        </label>
                        <input 
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full p-4 border-2 border-purple-200/70 rounded-2xl text-base transition-all duration-300 bg-purple-50/30 focus:outline-none focus:border-purple-400 focus:bg-white focus:shadow-xl focus:shadow-purple-100/50 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300 backdrop-blur-sm"
                            placeholder="Confirm your new password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-1 hover:from-purple-700 hover:to-indigo-800 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg border border-purple-400/20"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Resetting password...
                            </>
                        ) : (
                            '🔐 Reset Password'
                        )}
                    </button>

                    <p className="text-center mt-8 text-purple-700">
                        Remember your password?{' '}
                        <Link 
                            to="/login"
                            className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text no-underline font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                        >
                            Login here
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default ResetPassword;