// Updated Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../../services/auth-service.js';
import authUtils from '../../utils/auth.js';
import GoogleSignIn from './GoogleSignIn.jsx';

function Register() {
    const [formData, setData] = useState({
        username: '',
        email: '',
        pass: '',
        confirmPass: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    function handleChange(e) {
        setData({...formData, [e.target.name]: e.target.value});
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.pass !== formData.confirmPass) {
            setError('Passwords do not match!');
            setLoading(false);
            return;
        }

        try {
            await authService.register({
                username: formData.username,
                email: formData.email,
                pass: formData.pass
            });

            const loginResponse = await authService.login({
                username: formData.username,
                pass: formData.pass
            });

            const { token, user } = loginResponse.data;
            authUtils.login(token, user);
            navigate('/dashboard'); 
        } catch (error) {
            setError(error.response?.data?.error || 'Registration Failed');
        } finally {
            setLoading(false);
        }
    }

    if (authUtils.isAuthenticated()) {
        navigate('/dashboard');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex justify-center items-center p-6 font-sans">
            <div className="bg-white/90 backdrop-blur-lg p-12 rounded-3xl shadow-2xl w-full max-w-md border border-purple-200/50 transform hover:shadow-3xl transition-shadow duration-300">
                <div className="text-center mb-8 flex items-center justify-center gap-3">
                    <svg width="200" height="50" className="text-3xl font-black">
                        <defs>
                            <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#7c2d92" />
                                <stop offset="50%" stopColor="#db2777" />
                                <stop offset="100%" stopColor="#4338ca" />
                            </linearGradient>
                        </defs>
                        <text x="50%" y="60%" textAnchor="middle" fontSize="28" fontWeight="900" fill="url(#textGradient)">
                            GPA Lens
                        </text>
                    </svg>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-2xl text-center font-medium backdrop-blur-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-3 font-bold text-purple-700 text-lg">
                            Username:
                        </label>
                        <input 
                            type="text" 
                            name="username" 
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full p-4 border-2 border-purple-200/70 rounded-2xl text-base transition-all duration-300 bg-purple-50/30 focus:outline-none focus:border-purple-400 focus:bg-white focus:shadow-xl focus:shadow-purple-100/50 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300 backdrop-blur-sm"
                            placeholder="Choose a username"
                        />
                    </div>

                    <div>
                        <label className="block mb-3 font-bold text-purple-700 text-lg">
                            Email:
                        </label>
                        <input 
                            type="email" 
                            name="email" 
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full p-4 border-2 border-purple-200/70 rounded-2xl text-base transition-all duration-300 bg-purple-50/30 focus:outline-none focus:border-purple-400 focus:bg-white focus:shadow-xl focus:shadow-purple-100/50 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300 backdrop-blur-sm"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label className="block mb-3 font-bold text-purple-700 text-lg">
                            Password:
                        </label>
                        <input 
                            type="password"
                            name="pass"
                            value={formData.pass}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full p-4 border-2 border-purple-200/70 rounded-2xl text-base transition-all duration-300 bg-purple-50/30 focus:outline-none focus:border-purple-400 focus:bg-white focus:shadow-xl focus:shadow-purple-100/50 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300 backdrop-blur-sm"
                            placeholder="Create a secure password"
                        />
                    </div>

                    <div>
                        <label className="block mb-3 font-bold text-purple-700 text-lg">
                            Confirm Password:
                        </label>
                        <input 
                            type="password"
                            name="confirmPass"
                            value={formData.confirmPass}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            className="w-full p-4 border-2 border-purple-200/70 rounded-2xl text-base transition-all duration-300 bg-purple-50/30 focus:outline-none focus:border-purple-400 focus:bg-white focus:shadow-xl focus:shadow-purple-100/50 disabled:opacity-60 disabled:cursor-not-allowed hover:border-purple-300 backdrop-blur-sm"
                            placeholder="Confirm your password"
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
                                Creating account...
                            </>
                        ) : (
                            '🚀 Create Account'
                        )}
                    </button>

                    <p className="text-center mt-8 text-purple-700">
                        Already have an account?{' '}
                        <Link 
                            to="/login"
                            className="text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text no-underline font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                        >
                            Login here
                        </Link>
                    </p>
                </form>

                {/* Google Sign-In */}
                <div className="mt-10">
                    <GoogleSignIn 
                        onError={setError}
                        onLoading={setLoading}
                    />
                </div>
            </div>
        </div>
    )
}

export default Register;