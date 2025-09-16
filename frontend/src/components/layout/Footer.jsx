function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white py-10 border-t border-purple-500/20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* About Section */}
                    <div className="space-y-4">
                        <h4 className="text-transparent bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-xl font-extrabold flex items-center gap-3 font-mono tracking-tight">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                📊
                            </div>
                            GPA Lens
                        </h4>
                        <p className="text-purple-200 leading-relaxed font-sans">
                            This project is created as a way for me to learn to develop an app, 
                            while creating an app that helps people track their academics conveniently and easily!
                        </p>
                        <a 
                            href="https://docs.google.com/forms/d/e/1FAIpQLScYloRTk6SdiJXihhkG4G3-ptO4fLIIEZM8R8ka5FLFhgxsPw/viewform?usp=sharing&ouid=110800526281614307267"
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-100 transition-all duration-300 font-semibold px-4 py-2 rounded-lg hover:bg-purple-700/30 border border-purple-500/30 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/25 font-sans tracking-wide"
                        >
                            <span className="text-lg">📝</span>
                            Feedback Form
                        </a>
                    </div>

                    {/* Developer Section */}
                    <div className="space-y-4">
                        <h4 className="text-transparent bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-xl font-extrabold flex items-center gap-3 font-mono tracking-tight">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                👨‍💻
                            </div>
                            Developer
                        </h4>
                        <p className="text-purple-200 font-sans">
                            Created by <span className="font-bold text-transparent bg-gradient-to-r from-purple-100 to-pink-100 bg-clip-text">Ujjwal Raghuvanshi</span>
                        </p>
                    </div>

                    {/* Contact Section */}
                    <div className="space-y-4">
                        <h4 className="text-transparent bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-xl font-extrabold flex items-center gap-3 font-mono tracking-tight">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                📧
                            </div>
                            Contact Information
                        </h4>
                        <div className="flex flex-col space-y-3">
                            <a 
                                href="mailto:ujjwal.raghuvanshi2005@gmail.com" 
                                className="text-purple-300 hover:text-purple-100 transition-all duration-300 flex items-center gap-3 group px-4 py-2 rounded-lg hover:bg-purple-700/30 border border-transparent hover:border-purple-500/30 font-semibold font-sans tracking-wide"
                            >
                                Email
                            </a>
                            <a 
                                href="https://github.com/MetaZoan1" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-purple-300 hover:text-purple-100 transition-all duration-300 flex items-center gap-3 group px-4 py-2 rounded-lg hover:bg-purple-700/30 border border-transparent hover:border-purple-500/30 font-semibold font-sans tracking-wide"
                            >
                                Github
                            </a>
                            <a 
                                href="https://linkedin.com/in/ujjwal-raghuvanshi-4970a8353/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-purple-300 hover:text-purple-100 transition-all duration-300 flex items-center gap-3 group px-4 py-2 rounded-lg hover:bg-purple-700/30 border border-transparent hover:border-purple-500/30 font-semibold font-sans tracking-wide"
                            >
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-purple-500/30 pt-6 text-center">
                    <p className="text-purple-300 text-sm font-sans">
                        &copy; {currentYear} GPA Lens. Built with React and Node.js
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;