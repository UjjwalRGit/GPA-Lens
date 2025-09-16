import { useState, useEffect } from 'react';
import { toLetterGrade } from '../../utils/gradeUtils';
import { dataService } from '../../services/data-service.js';
import DeleteClassPopUp from './DeleteClassPopUp.jsx';
import UpdateClass from './UpdateClass.jsx';

function SemesterView({ semester, classes, onClassUpdated, onClassDeleted }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [semesterGPA, setSemesterGPA] = useState({ gpa: 0, totalCredits: 0 });
    const [updatingClass, setUpdatingClass] = useState(null);
    const [deletingClass, setDeletingClass] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [classToDelete, setClassToDelete] = useState(null);

    useEffect(() => {
        loadSemesterGPA();
    }, [semester, classes]);

    async function loadSemesterGPA() {
        try {
            const response = await dataService.getSemesterGPA(semester);
            setSemesterGPA(response.data);
        } catch (error) {
            console.error('Error loading semester GPA:', error);
        }
    }

    function handleUpdate(classItem) {
        setUpdatingClass(classItem);
    }

    function handleDeleteClick(classItem) {
        setClassToDelete(classItem);
        setShowDelete(true);
    }

    async function handleDeleteConfirm() {
        if(!classToDelete) {
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
        return null;
    }

    return (
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-purple-200/50 overflow-hidden transition-all duration-300 hover:shadow-3xl">
            {updatingClass && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl border-2 border-purple-200 max-w-2xl w-full max-h-[90vh] overflow-auto">
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
                </div>
            )}

            <DeleteClassPopUp
                isOpen={showDelete}
                title="Delete Class"
                message={`Are you sure you want to delete ${classToDelete?.department} ${classToDelete?.classId}? This action cannot be undone`}
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                isDestructive={true}
            />

            {/* Semester Header */}
            <div 
                className="bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 p-8 cursor-pointer flex justify-between items-center transition-all duration-300 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-700"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="text-white">
                    <h3 className="text-3xl font-black mb-4 flex items-center gap-4 font-sans">
                        📅 {semester}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/30">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⭐</span>
                                <div>
                                    <div className="text-white/80 font-medium">Semester GPA</div>
                                    <div className="text-2xl font-black text-white">{semesterGPA.gpa}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/30">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📚</span>
                                <div>
                                    <div className="text-white/80 font-medium">Total Credits</div>
                                    <div className="text-2xl font-black text-white">{semesterGPA.totalCredits}</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/30">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">📊</span>
                                <div>
                                    <div className="text-white/80 font-medium">Total Classes</div>
                                    <div className="text-2xl font-black text-white">{classes.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`text-3xl text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    ▼
                </div>
            </div>

            {/* Semester Classes */}
            {isExpanded && (
                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {classes.map(course => (
                            <div 
                                key={course.id}
                                className="bg-gradient-to-br from-white to-purple-50/50 rounded-2xl p-6 shadow-lg border-2 border-purple-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-purple-300 hover:from-white hover:to-purple-100/70 group"
                            >
                                {/* Class Header */}
                                <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-purple-100"> 
                                    <div>
                                        <h4 className="text-purple-700 text-xl font-black flex items-center gap-2 mb-2 font-sans">
                                            {course.department} {course.classId}
                                        </h4>
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
                                            <span className="font-black text-purple-800 text-xl">{toLetterGrade(course.grade)}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-100"> 
                                        <span className="font-bold text-pink-700 text-lg font-sans">Credits:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">📚</span>
                                            <span className="font-black text-pink-800 text-xl">{course.credits}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Effect Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SemesterView;