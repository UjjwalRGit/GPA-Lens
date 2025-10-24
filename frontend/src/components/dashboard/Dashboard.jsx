import { useState, useEffect } from 'react';
import dataService from '../../services/data-service.js';
import ClassList from './ClassList.jsx';
import AddClass from './AddClass.jsx';
import SemesterView from './SemesterView.jsx';
import { sortSemesters } from '../../utils/semesterUtils.js';
import Calculator from './Calculator.jsx';
import GPAGraph from '../other/GPAGraph.jsx';
import { useGuestMode } from '../../contexts/GuestModeContext.jsx';

function Dashboard() {
    const { isGuestMode, guestData } = useGuestMode();
    const [classes, setClasses] = useState([]);
    const [groupedClasses, setGroupedClasses] = useState({});
    const [gpaData, setGpaData] = useState({ gpa: 0, totalCredits: 0, totalClasses: 0});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [viewMode, setViewMode] = useState('semester');
    const [showCalculator, setShowCalculator] = useState(false);
    const [showGraph, setShowGraph] = useState(true);

    useEffect(() => {
        loadData();
    }, [isGuestMode, guestData]);

    async function loadData() {
        try {
            setLoading(true);
            
            if (isGuestMode) {
                // Load data from guest storage
                const guestClasses = guestData.classes || [];
                setClasses(guestClasses);
                
                // Calculate GPA from guest data
                const gpa = calculateGPA(guestClasses);
                setGpaData(gpa);
                
                // Group classes by semester
                const grouped = groupClassesBySemester(guestClasses);
                setGroupedClasses(grouped);
            } else {
                // Load data from API
                const [classesResponse, gpaResponse, groupedResponse] = await Promise.all([
                    dataService.getClasses(),
                    dataService.getGPA(),
                    dataService.getClassesBySemester()
                ]);

                setClasses(classesResponse.data);
                setGpaData(gpaResponse.data);
                setGroupedClasses(groupedResponse.data);
            }
        } catch (error) {
            setError('Failed to load data');
            console.error('Error loading data: ', error);
        } finally {
            setLoading(false);
        }
    }

    function calculateGPA(classList) {
        if (classList.length === 0) {
            return { gpa: '0.00', totalCredits: 0, totalClasses: 0 };
        }

        let totalPoints = 0;
        let totalCredits = 0;

        classList.forEach(course => {
            const grade = parseFloat(course.grade);
            const credits = parseInt(course.credits);
            totalPoints += grade * credits;
            totalCredits += credits;
        });

        const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
        
        return {
            gpa,
            totalCredits,
            totalClasses: classList.length
        };
    }

    function groupClassesBySemester(classList) {
        const grouped = {};
        classList.forEach(course => {
            const semester = course.semester || 'Unassigned';
            if (!grouped[semester]) {
                grouped[semester] = [];
            }
            grouped[semester].push(course);
        });
        return grouped;
    }

    function handleClassAdded(newClass) {
        setClasses(prevClasses => [newClass, ...prevClasses]);
        
        setGroupedClasses(prevGrouped => ({
            ...prevGrouped,
            [newClass.semester]: [
                newClass,
                ...(prevGrouped[newClass.semester] || [])
            ]
        }));
        
        setShowAddForm(false);
        
        if (isGuestMode) {
            // Recalculate GPA for guest mode
            const updatedClasses = [newClass, ...classes];
            const gpa = calculateGPA(updatedClasses);
            setGpaData(gpa);
        } else {
            updateGPAOnly();
        }
    }

    function handleClassUpdated(updatedClass) {
        setClasses(prevClasses => 
            prevClasses.map(course => 
                course.id === updatedClass.id ? updatedClass : course
            )
        );
        
        setGroupedClasses(prevGrouped => {
            const newGrouped = { ...prevGrouped };
            
            Object.keys(newGrouped).forEach(semester => {
                newGrouped[semester] = newGrouped[semester].filter(
                    course => course.id !== updatedClass.id
                );
                if (newGrouped[semester].length === 0) {
                    delete newGrouped[semester];
                }
            });
            
            if (!newGrouped[updatedClass.semester]) {
                newGrouped[updatedClass.semester] = [];
            }
            newGrouped[updatedClass.semester].push(updatedClass);
            
            return newGrouped;
        });
        
        if (isGuestMode) {
            // Recalculate GPA for guest mode
            const updatedClasses = classes.map(c => c.id === updatedClass.id ? updatedClass : c);
            const gpa = calculateGPA(updatedClasses);
            setGpaData(gpa);
        } else {
            updateGPAOnly();
        }
    }

    function handleClassDeleted(classId) {
        setClasses(prevClasses => prevClasses.filter(course => course.id !== classId));
        
        setGroupedClasses(prevGrouped => {
            const newGrouped = { ...prevGrouped };
            Object.keys(newGrouped).forEach(semester => {
                newGrouped[semester] = newGrouped[semester].filter(
                    course => course.id !== classId
                );
                if (newGrouped[semester].length === 0) {
                    delete newGrouped[semester];
                }
            });
            return newGrouped;
        });
        
        if (isGuestMode) {
            // Recalculate GPA for guest mode
            const updatedClasses = classes.filter(c => c.id !== classId);
            const gpa = calculateGPA(updatedClasses);
            setGpaData(gpa);
        } else {
            updateGPAOnly();
        }
    }

    async function updateGPAOnly() {
        try {
            const gpaResponse = await dataService.getGPA();
            setGpaData(gpaResponse.data);
        } catch (error) {
            console.error('Error updating GPA: ', error);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center font-sans">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-purple-200/50">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                        <p className="text-xl font-semibold text-purple-800">Loading your academic dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    const sortedSemesters = sortSemesters(Object.keys(groupedClasses));
    const hasData = Object.keys(groupedClasses).length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 font-sans">
            <div className="max-w-7xl mx-auto p-6">
                {/* Guest Mode Banner */}
                {isGuestMode && (
                    <div className="mb-8 bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-300 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-4">
                            <span className="text-4xl">👤</span>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-yellow-800 mb-2">Guest Mode Active</h3>
                                <p className="text-yellow-700 font-medium">
                                    You're using GPA Lens in guest mode. Your data will be cleared when you close your browser.
                                </p>
                            </div>
                            <a 
                                href="/register" 
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 no-underline"
                            >
                                Sign Up to Save
                            </a>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <div className="text-center mb-8 md:mb-12">
                    {/* Responsive Header */}
                    <div className="flex items-center justify-center gap-2 md:gap-6 mb-6 md:mb-8">
                        <div className="text-center">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent tracking-tight leading-tight">
                                GPA Lens
                            </h1>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-8 text-white transform hover:scale-105 transition-all duration-300 border border-purple-400/20">
                            <h3 className="text-purple-100 font-bold mb-2 md:mb-3 text-sm md:text-lg tracking-wide">Overall GPA</h3>
                            <div className="text-3xl md:text-5xl font-black mb-1 md:mb-2">
                                {gpaData.gpa || '0.00'}
                            </div>
                            <p className="text-purple-200 font-medium text-xs md:text-base">Academic Performance</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-8 text-white transform hover:scale-105 transition-all duration-300 border border-blue-400/20">
                            <h3 className="text-blue-100 font-bold mb-2 md:mb-3 text-sm md:text-lg tracking-wide">Total Classes</h3>
                            <div className="text-3xl md:text-5xl font-black mb-1 md:mb-2">
                                {gpaData.totalClasses || 0}
                            </div>
                            <p className="text-blue-200 font-medium text-xs md:text-base">All Courses</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-8 text-white transform hover:scale-105 transition-all duration-300 border border-green-400/20">
                            <h3 className="text-green-100 font-bold mb-2 md:mb-3 text-sm md:text-lg tracking-wide">Total Credits</h3>
                            <div className="text-3xl md:text-5xl font-black mb-1 md:mb-2">
                                {gpaData.totalCredits || 0}
                            </div>
                            <p className="text-green-200 font-medium text-xs md:text-base">Credit Hours</p>
                        </div>
                    </div>
                </div>
                
                {error && (
                    <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 text-red-800 px-6 py-4 rounded-2xl mb-8 flex items-center gap-4 shadow-lg">
                        <span className="text-2xl">⚠️</span>
                        <span className="font-semibold">{error}</span>
                    </div>
                )}

                {/* Controls Section */}
                <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-10">
                    <div className="flex flex-wrap justify-center gap-4">
                        <button 
                            onClick={() => setViewMode('semester')} 
                            className={`px-8 py-4 font-bold rounded-2xl transition-all duration-300 tracking-wide ${
                                viewMode === 'semester' 
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 ring-4 ring-purple-200' 
                                    : 'bg-white/80 backdrop-blur-sm text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-800 shadow-lg'
                            }`}
                        >
                            📅 Semester View
                        </button>
                        <button 
                            onClick={() => setViewMode('all')} 
                            className={`px-8 py-4 font-bold rounded-2xl transition-all duration-300 tracking-wide ${
                                viewMode === 'all' 
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 ring-4 ring-purple-200' 
                                    : 'bg-white/80 backdrop-blur-sm text-purple-700 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-800 shadow-lg'
                            }`}
                        >
                            📋 All Classes
                        </button>
                        {hasData && (
                            <button
                                onClick={() => setShowGraph(!showGraph)}
                                className={`px-8 py-4 font-bold rounded-2xl transition-all duration-300 tracking-wide ${
                                    showGraph 
                                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 ring-4 ring-pink-200' 
                                        : 'bg-white/80 backdrop-blur-sm text-pink-700 border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50 hover:text-pink-800 shadow-lg'
                                }`}
                            >
                                📈 {showGraph ? 'Hide Graph' : 'Show Graph'}
                            </button>
                        )}
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => setShowCalculator(true)}
                            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 tracking-wide"
                            title="Calculate current grade for a class"
                        >
                            🧮 Grade Calculator
                        </button>

                        <button 
                            onClick={() => setShowAddForm(!showAddForm)} 
                            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 tracking-wide"
                        >
                            {showAddForm ? '❌ Cancel' : '➕ Add New Class'}
                        </button>
                    </div>
                </div>

                {/* Add Class Form */}
                {showAddForm && (
                    <div className="mb-10">
                        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-purple-200/50 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
                                <h2 className="text-3xl font-bold flex items-center gap-4">
                                    ➕ Add New Class
                                </h2>
                                <p className="text-purple-100 mt-2 font-medium">
                                    Enter your class details to track your academic progress
                                </p>
                            </div>
                            <div className="p-8">
                                <AddClass onClassAdded={handleClassAdded} onCancel={() => setShowAddForm(false)} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Calculator Modal */}
                {showCalculator && (
                    <Calculator onClose={() => setShowCalculator(false)}/>
                )}

                {/* GPA Graph */}
                {hasData && showGraph && (
                    <div className="mb-10">
                        <GPAGraph groupedClasses={groupedClasses} />
                    </div>
                )}

                {/* Main Content */}
                {viewMode === 'semester' ? (
                    <div className="space-y-8">
                        {sortedSemesters.length === 0 ? (
                            <div className="text-center py-20 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-purple-200/50">
                                <div className="text-8xl mb-8">📚</div>
                                <p className="text-2xl text-purple-700 font-bold mb-4">
                                    Ready to start your academic journey?
                                </p>
                                <p className="text-lg text-purple-600 font-medium">
                                    Add your first class to get started tracking your GPA!
                                </p>
                            </div>
                        ) : (
                            sortedSemesters.map(semester => (
                                <SemesterView
                                    key={semester}
                                    semester={semester}
                                    classes={groupedClasses[semester]}
                                    onClassUpdated={handleClassUpdated}
                                    onClassDeleted={handleClassDeleted}
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <ClassList 
                        classes={classes} 
                        onClassUpdated={handleClassUpdated} 
                        onClassDeleted={handleClassDeleted}
                    />
                )}
            </div>
        </div>
    )
}

export default Dashboard;