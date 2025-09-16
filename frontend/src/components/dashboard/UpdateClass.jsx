import { useState } from 'react';
import { dataService } from '../../services/data-service.js';
import { toGpa, toLetterGrade, getLetterGrades } from '../../utils/gradeUtils.js';
import { getSemesters } from '../../utils/semesterUtils.js';

function UpdateClass({ classData, onUpdate, onCancel }) {
    const [formData, setData] = useState({
        department: classData.department,
        classId: classData.classId.toString(),
        letterGrade: toLetterGrade(classData.grade),
        credits: classData.credits.toString(),
        semester: classData.semester || 'Fall 2024'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const letterGrades = getLetterGrades();
    const semesters = getSemesters();

    function handleChange(e){
        setData({...formData, [e.target.name]: e.target.value});
    }

    async function handleSubmit(e){
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const updateData = {
                department: formData.department,
                classId: parseInt(formData.classId),
                grade: toGpa(formData.letterGrade),
                credits: parseInt(formData.credits),
                semester: formData.semester
            };

            const response = await dataService.updateClass(classData.id, updateData);
            onUpdate(response.data);
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to update class');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-5 font-sans">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-200/50">
                {/* Header */}
                <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 text-white p-8 rounded-t-3xl">
                    <h3 className="text-3xl font-black flex items-center gap-4">
                        ✏️ Update Class Information
                    </h3>
                    <p className="text-purple-100 mt-2 font-medium">
                        Modify the details for {classData.department} {classData.classId}
                    </p>
                </div>

                <div className="p-8">
                    {error && (
                        <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 text-red-800 px-6 py-4 rounded-2xl mb-6 flex items-center gap-4 shadow-lg">
                            <span className="text-2xl">⚠️</span>
                            <span className="font-semibold">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {/* Department Input */}
                            <div className="flex flex-col">
                                <label className="mb-3 font-bold text-purple-700 text-sm tracking-wide">
                                    Department
                                </label>
                                <input 
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    maxLength="4"
                                    required
                                    disabled={loading}
                                    className="p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                                />
                            </div>

                            {/* Class ID Input */}
                            <div className="flex flex-col">
                                <label className="mb-3 font-bold text-purple-700 text-sm tracking-wide">
                                    Class ID
                                </label>
                                <input 
                                    type="number"
                                    name="classId"
                                    value={formData.classId}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                                />
                            </div>

                            {/* Letter Grade Select */}
                            <div className="flex flex-col">
                                <label className="mb-3 font-bold text-purple-700 text-sm tracking-wide">
                                    Letter Grade
                                </label>
                                <select
                                    name="letterGrade"
                                    value={formData.letterGrade}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                                >
                                    <option value="">Select Grade</option>
                                    {letterGrades.map(grade => (
                                        <option key={grade} value={grade}>
                                            {grade}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Credits Input */}
                            <div className="flex flex-col">
                                <label className="mb-3 font-bold text-purple-700 text-sm tracking-wide">
                                    Credits
                                </label>
                                <input 
                                    type="number"
                                    name="credits"
                                    value={formData.credits}
                                    onChange={handleChange}
                                    min="1"
                                    max="6"
                                    required
                                    disabled={loading}
                                    className="p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 placeholder-purple-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                                />
                            </div>

                            {/* Semester Select */}
                            <div className="flex flex-col">
                                <label className="mb-3 font-bold text-purple-700 text-sm tracking-wide">
                                    Semester
                                </label>
                                <select
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                    className="p-4 border-2 border-purple-200 rounded-xl text-base transition-all duration-300 bg-purple-50/50 focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg focus:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                                > 
                                    <option value="">Select Semester</option>
                                    {semesters.map(semester => (
                                        <option key={semester} value={semester}>
                                            {semester}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 border-t-2 border-purple-100">
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 tracking-wide"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Updating Class...
                                    </>
                                ) : (
                                    <>
                                        ✏️ Update Class
                                    </>
                                )}
                            </button>
                            <button 
                                type="button" 
                                onClick={onCancel} 
                                className="px-10 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl shadow-xl transition-all duration-300 hover:from-gray-600 hover:to-gray-700 hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3 tracking-wide"
                                disabled={loading}
                            >
                                ❌ Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default UpdateClass;