function DeleteClassPopUp({ isOpen, onConfirm, onCancel, title, message, confirmText = "Delete", cancelText = "Cancel", isDestructive = false }) {
    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-5 font-sans" onClick={onCancel}>
            <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center transform animate-in zoom-in-95 duration-300 border-2 border-purple-200/50" onClick={(e) => e.stopPropagation()}>
                <div className="mb-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
                        ⚠️
                    </div>
                    <h3 className="text-red-600 text-2xl font-black mb-4 font-sans">
                        {title}
                    </h3>
                </div>

                <div className="mb-8">
                    <p className="text-gray-700 leading-relaxed text-lg font-medium">{message}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl shadow-lg transition-all duration-300 hover:from-gray-600 hover:to-gray-700 hover:shadow-xl hover:-translate-y-0.5 font-sans tracking-wide"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-8 py-4 font-bold rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 font-sans tracking-wide ${
                            isDestructive 
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600' 
                                : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600'
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteClassPopUp;