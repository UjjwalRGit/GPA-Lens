// Updated ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth-service.js';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    function handleChange(e) {
        setEmail(e.target.value);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            await authService.forgotPassword(email);
            setMessage('Password reset instructions sent to your email');
        } catch (error) {
            setError(error?.response?.data?.error || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex justify-center items-start pt-8 pb-8 px-6 font-sans">
            <div className="bg-white/90 backdrop-blur-lg p-12 rounded-3xl shadow-2xl w-full max-w-md border border-purple-200/50 transform hover:shadow-3xl transition-shadow duration-300 my-4">
                <h2 className="text-center mb-8 text-purple-800 text-3xl font-black flex items-center justify-center gap-3 tracking-tight">
                    🔑 Forgot Password
                </h2>
                
                <p className="text-center mb-8 text-purple-700 leading-relaxed font-medium">
                    Enter your email and we'll send you instructions to reset your password.
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

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block mb-3 font-bold text-purple-700 text-lg">
                            Email:
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={handleChange}
                            placeholder="Enter your email address"
                            required
                            disabled={loading}
                            className="w-full p-4 border-2 border-purple-200/70 rounded-2xl text-base transition-all duration-300 bg-purple-50/30 placeholder-purple-400 focus:outline-none focus:border-purple-400 focus:bg-white focus:shadow-xl focus:shadow-purple-100/50 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300 backdrop-blur-sm"
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
                                Sending...
                            </>
                        ) : (
                            '📧 Send Reset Request'
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

export default ForgotPassword;