function DeleteEventPopUp({ isOpen, event, onConfirm, onCancel, isLoading = false }) {
    if (!isOpen || !event) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 flex justify-center items-center z-[60] p-5" onClick={onCancel}>
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center transform animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                <div className="mb-6">
                    <h3 className="text-red-600 text-2xl font-bold flex items-center justify-center gap-3 mb-4">
                        ⚠️ Delete Event
                    </h3>
                </div>

                <div className="mb-8">
                    <p className="text-gray-600 leading-relaxed text-lg mb-4">
                        Are you sure you want to delete 
                        <strong className="text-red-600"> "{event.event_name || event.title}"</strong>?
                    </p>
                    <p className="text-gray-500">This action cannot be undone.</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:bg-gray-600 hover:shadow-xl"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Deleting...
                            </>
                        ) : (
                            '🗑️ Delete Event'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteEventPopUp