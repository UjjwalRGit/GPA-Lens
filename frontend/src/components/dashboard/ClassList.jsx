import { useState } from 'react';
import { dataService } from '../../services/data-service.js';
import { toLetterGrade } from '../../utils/gradeUtils.js';
import DeleteClassPopUp from './DeleteClassPopUp.jsx';
import UpdateClass from './UpdateClass.jsx';

function ClassList({ classes, onClassUpdated, onClassDeleted }){
    const [updatingClass, setUpdatingClass] = useState(null);
    const [deletingClass, setDeletingClass] = useState(null);
    const [showDeleteConfirm, setShowDelete] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);

    function handleUpdate(classItem) {
        setUpdatingClass(classItem);
    }

    function handleDeleteClick(classItem) {
        setClassToDelete(classItem);
        setShowDelete(true);
    }

    async function handleDeleteConfirm() {
        if (!classToDelete) {
            return;
        }

        setShowDelete(false);
        setDeletingClass(classToDelete.id);

        try {
            await dataService.deleteClass(classToDelete.id);
            onClassDeleted(classToDelete.id);
        } catch (error) {
            console.error('Error deleting class: ', error);
            alert('Failed to delete class');
        } finally {
            setDeletingClass(null);
            setClassToDelete(null);
        }
    }

    function handleDeleteCancel() {
        setShowDelete(false);
        setClassToDelete(null);
    }

    function handleUpdateCompletion(updatedClass) {
        onClassUpdated(updatedClass);
        setUpdatingClass(null);
    }

    function handleUpdatingCancel() {
        setUpdatingClass(null);
    }

    if (classes.length === 0) {
        return (
            <div className="text-center py-20 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-purple-200/50">
                <div className="text-8xl mb-8">📚</div>
                <p className="text-2xl text-purple-700 font-bold mb-4 font-sans">
                    No classes found
                </p>
                <p className="text-lg text-purple-600 font-medium font-sans">
                    Add your first class to get started tracking your progress!
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h3 className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text flex items-center justify-center gap-4 mb-4 font-sans">
                    📋 All Your Classes
                </h3>
                <p className="text-lg text-purple-600 font-medium">
                    Complete overview of your academic coursework
                </p>
            </div>

            {updatingClass && (
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-purple-200/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                        <h2 className="text-xl font-bold">✏️ Update Class</h2>
                    </div>
                    <div className="p-6">
                        <UpdateClass 
                            classData={updatingClass} 
                            onUpdate={handleUpdateCompletion} 
                            onCancel={handleUpdatingCancel}
                        />
                    </div>
                </div>
            )}

            <DeleteClassPopUp
                isOpen={showDeleteConfirm}
                title="Delete Class"
                message={`Are you sure you want to delete ${classToDelete?.department} ${classToDelete?.classId}? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                isDestructive={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classes.map(course => (
                    <div 
                        key={course.id}
                        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-purple-100/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-purple-300/50 hover:bg-white group"
                    >
                        {/* Class Header */}
                        <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-purple-100">
                            <div>
                                <h4 className="text-purple-700 text-xl font-black flex items-center gap-2 mb-2 font-sans">
                                    {course.department} {course.classId}
                                </h4>
                                {course.semester && (
                                    <span className="inline-block bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold border border-purple-200">
                                        {course.semester}
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleUpdate(course)}
                                    className="px-3 py-2 text-sm bg-white text-purple-600 border-2 border-purple-200 rounded-xl font-semibold transition-all duration-300 hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed font-sans"
                                    disabled={updatingClass?.id === course.id}
                                >
                                    ✏️ Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(course)}
                                    className="px-3 py-2 text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:from-red-600 hover:to-pink-600 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none font-sans"
                                    disabled={deletingClass === course.id}
                                >
                                    {deletingClass === course.id ? (
                                        <>
                                            <div className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        '🗑️ Delete'
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Class Details */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
                                <span className="font-bold text-purple-700 text-lg font-sans">Grade:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⭐</span>
                                    <span className="font-black text-purple-800 text-xl">
                                        {toLetterGrade(course.grade)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100">
                                <span className="font-bold text-pink-700 text-lg font-sans">Credits:</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📚</span>
                                    <span className="font-black text-pink-800 text-xl">
                                        {course.credits}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Hover Effect Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ClassList;