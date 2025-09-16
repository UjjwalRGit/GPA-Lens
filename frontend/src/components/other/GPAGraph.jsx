import { useState, useEffect } from 'react';
import { LineChart, Line, YAxis, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { dataService } from '../../services/data-service.js';
import { sortChronologically } from '../../utils/semesterUtils.js';

function GPAGraph({ groupedClasses }) {
    const [graphData, setGraphData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Function to abbreviate semester names
    function abbreviateSemester(semester) {
        if (!semester) return '';
        
        const parts = semester.split(' ');
        if (parts.length >= 2) {
            const season = parts[0];
            const year = parts[1];
            
            // Get last 2 digits of year
            const shortYear = year.slice(-2);
            
            // Abbreviate season
            const seasonAbbrev = {
                'Fall': 'F',
                'Spring': 'S', 
                'Summer': 'Su'
            };
            
            return `${seasonAbbrev[season] || season.charAt(0)}${shortYear}`;
        }
        
        return semester;
    }

    useEffect(() => {
        console.log('GPAGraph received groupedClasses:', groupedClasses);
        
        async function loadSemesterGPAs() {
            try {
                setLoading(true);
                const semesters = Object.keys(groupedClasses);
                console.log('Semesters found:', semesters);
                
                const gpaPromises = semesters.map(semester => 
                    dataService.getSemesterGPA(semester).then(response => ({
                        semester: abbreviateSemester(semester), // Abbreviate here
                        fullSemester: semester, // Keep full name for tooltip
                        gpa: parseFloat(response.data.gpa),
                        credits: response.data.totalCredits
                    })).catch(error => {
                        console.error(`Error retrieving GPA for ${semester}:`, error);
                        return { 
                            semester: abbreviateSemester(semester), 
                            fullSemester: semester,
                            gpa: 0, 
                            credits: 0 
                        };
                    })
                )

                const gpaData = await Promise.all(gpaPromises);
                console.log('GPA data loaded:', gpaData);

                const sortedGPAs = sortChronologically(gpaData.map(item => item.fullSemester))
                    .map(fullSemester => gpaData.find(item => item.fullSemester === fullSemester))
                    .filter(item => item && item.gpa > 0);

                console.log('Sorted GPAs:', sortedGPAs);
                setGraphData(sortedGPAs);
            } catch (error) {
                setError('Failed to load semester GPA data');
                console.error('Error loading semester GPAs:', error);
            } finally {
                setLoading(false);
            }
        }

        if (groupedClasses && Object.keys(groupedClasses).length > 0) {
            loadSemesterGPAs();
        } else {
            console.log('No groupedClasses data, showing empty state');
            setGraphData([]);
            setLoading(false);
        }
    }, [groupedClasses])

    function GPAToolTip({ active, payload, label }) {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white/95 backdrop-blur-lg border-2 border-purple-300 rounded-2xl p-4 md:p-5 shadow-2xl text-sm font-sans">
                    <p className="font-black text-purple-700 mb-3 text-base md:text-lg">{data.fullSemester}</p>
                    <div className="space-y-2">
                        <p className="flex items-center gap-2 text-purple-600 text-sm">
                            <span className="text-base">⭐</span>
                            GPA: <span className="font-bold text-purple-800">{data.gpa.toFixed(2)}</span>
                        </p>
                        <p className="flex items-center gap-2 text-purple-600 text-sm">
                            <span className="text-base">📚</span>
                            Credits: <span className="font-bold text-purple-800">{data.credits}</span>
                        </p>
                    </div>
                </div>
            )
        }
        return null;
    }

    function GPADot(props) {
        const { cx, cy, payload } = props;
        if (!payload) {
            return null;
        }

        const gpa = payload.gpa || 0;

        let dotColor;
        if (gpa === 4.0) {
            dotColor = '#8b5cf6'; // Purple
        } else if (gpa >= 3.5) {
            dotColor = '#06d6a0'; // Emerald
        } else if (gpa >= 3.0 && gpa < 3.5) {
            dotColor = '#ffd60a'; // Golden
        } else if (gpa >= 2.5 && gpa < 3.0) {
            dotColor = '#ff8500'; // Orange
        } else if (gpa >= 2.0 && gpa < 2.5) {
            dotColor = '#ff6b6b'; // Coral
        } else {
            dotColor = '#e63946'; // Red
        }

        return (
            <circle
                cx={cx}
                cy={cy}
                r={window.innerWidth < 640 ? 6 : 8}
                fill={dotColor}
                stroke="#fff"
                strokeWidth={window.innerWidth < 640 ? 2 : 3}
            />
        )
    }

    if (loading) {
        return (
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-purple-200/50 p-8 md:p-12 font-sans">
                <div className="flex flex-col items-center justify-center text-lg md:text-xl text-purple-700 space-y-4">
                    <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                    <span className="font-semibold text-center">Loading your GPA trends...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-red-200/50 p-8 md:p-12 font-sans">
                <div className="bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 text-red-800 px-4 md:px-6 py-3 md:py-4 rounded-2xl flex items-center gap-3 md:gap-4 shadow-lg">
                    <span className="text-xl md:text-2xl">⚠️</span>
                    <span className="font-semibold text-sm md:text-base">{error}</span>
                </div>
            </div>
        )
    }

    if (graphData.length === 0) {
        return (
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-purple-200/50 p-12 md:p-20 text-center font-sans">
                <div className="text-6xl md:text-8xl mb-6 md:mb-8">📊</div>
                <p className="text-xl md:text-2xl text-purple-700 font-bold mb-3 md:mb-4">
                    No GPA data available yet
                </p>
                <p className="text-base md:text-lg text-purple-600 font-medium">
                    Add some classes to see your academic progress trends!
                </p>
            </div>
        )
    }
    
    return (
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-purple-200/50 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 p-4 md:p-8 text-white">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
                    <div>
                        <h3 className="text-xl md:text-3xl font-black mb-2 flex items-center gap-2 md:gap-4">
                            📊 Your GPA Progress
                        </h3>
                        <p className="text-purple-100 font-medium text-sm md:text-base">
                            Track your academic performance across semesters
                        </p>
                    </div>
                    
                    {/* Responsive Legend */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 md:gap-3 text-xs md:text-sm w-full lg:w-auto">
                        <div className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 md:py-2 rounded-lg md:rounded-xl border border-white/30">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-purple-400"></div>
                            <span className="text-purple-100 font-medium">4.0 Perfect</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 md:py-2 rounded-lg md:rounded-xl border border-white/30">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-emerald-400"></div>
                            <span className="text-purple-100 font-medium">3.5+ Excellent</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 md:py-2 rounded-lg md:rounded-xl border border-white/30">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-400"></div>
                            <span className="text-purple-100 font-medium">3.0+ Good</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 md:py-2 rounded-lg md:rounded-xl border border-white/30">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-orange-400"></div>
                            <span className="text-purple-100 font-medium">2.5+ Average</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 md:py-2 rounded-lg md:rounded-xl border border-white/30">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-400"></div>
                            <span className="text-purple-100 font-medium">2.0+ Needs Work</span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-sm px-2 md:px-3 py-1 md:py-2 rounded-lg md:rounded-xl border border-white/30">
                            <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-600"></div>
                            <span className="text-purple-100 font-medium">&lt;2.0 Critical</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graph */}
            <div className="p-4 md:p-8 bg-gradient-to-br from-purple-50/50 to-indigo-50/50">
                <ResponsiveContainer width="100%" height={window.innerWidth < 640 ? 300 : 400}>
                    <LineChart data={graphData}
                        margin={{ 
                            top: 20, 
                            right: window.innerWidth < 640 ? 10 : 50, 
                            left: window.innerWidth < 640 ? 10 : 20, 
                            bottom: 20 
                        }} > 
                        <CartesianGrid 
                            strokeDasharray="3 3" 
                            stroke="#e0e7ff" 
                            strokeOpacity={0.6}
                        />
                        <XAxis
                            dataKey="semester"
                            tick={{ 
                                fontSize: window.innerWidth < 640 ? 10 : 12, 
                                fill: '#6b46c1', 
                                fontWeight: 'bold' 
                            }}
                            axisLine={{ stroke: '#8b5cf6', strokeWidth: 2 }}
                            tickLine={{ stroke: '#8b5cf6' }}
                            interval={0}
                            angle={window.innerWidth < 640 ? -45 : 0}
                            textAnchor={window.innerWidth < 640 ? 'end' : 'middle'}
                            height={window.innerWidth < 640 ? 60 : 30}
                        />
                        <YAxis
                            domain={[0, 4]}
                            tick={{ 
                                fontSize: window.innerWidth < 640 ? 10 : 12, 
                                fill: '#6b46c1', 
                                fontWeight: 'bold' 
                            }}
                            axisLine={{ stroke: '#8b5cf6', strokeWidth: 2 }}
                            tickLine={{ stroke: '#8b5cf6' }}
                            label={{
                                value: 'GPA',
                                angle: -90,
                                position: 'insideLeft',
                                style: { 
                                    textAnchor: 'middle', 
                                    fill: '#6b46c1', 
                                    fontWeight: 'bold',
                                    fontSize: window.innerWidth < 640 ? '12px' : '14px'
                                }
                            }}
                        />
                        <Tooltip content={<GPAToolTip />} />

                        {/* Reference Lines */}
                        <ReferenceLine y={4.0} stroke="#8b5cf6" strokeDasharray="5 5" strokeOpacity={0.7} strokeWidth={2} />
                        <ReferenceLine y={3.5} stroke="#06d6a0" strokeDasharray="5 5" strokeOpacity={0.7} strokeWidth={2} />
                        <ReferenceLine y={3.0} stroke="#ffd60a" strokeDasharray="5 5" strokeOpacity={0.7} strokeWidth={2} />
                        <ReferenceLine y={2.5} stroke="#ff8500" strokeDasharray="5 5" strokeOpacity={0.7} strokeWidth={2} />
                        <ReferenceLine y={2.0} stroke="#ff6b6b" strokeDasharray="5 5" strokeOpacity={0.7} strokeWidth={2} />

                        <Line
                            type="monotone"
                            dataKey="gpa"
                            stroke="url(#purpleGradient)"
                            strokeWidth={window.innerWidth < 640 ? 3 : 4}
                            dot={<GPADot />}
                            activeDot={{ 
                                r: window.innerWidth < 640 ? 8 : 10, 
                                stroke: "#8b5cf6", 
                                strokeWidth: window.innerWidth < 640 ? 2 : 3, 
                                fill: "#fff",
                                className: "drop-shadow-lg"
                            }}
                        />
                        
                        {/* Gradient Definition */}
                        <defs>
                            <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="50%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Statistics */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 md:p-8 border-t-2 border-purple-200">
                <h4 className="text-lg md:text-xl font-black text-purple-700 mb-4 md:mb-6 text-center">📈 Academic Statistics</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-3 md:p-6 border-2 border-purple-200 shadow-lg">
                        <div className="text-lg md:text-2xl mb-1 md:mb-2">🏆</div>
                        <span className="block text-xs md:text-sm font-bold text-purple-600 mb-1 md:mb-2">Highest GPA</span>
                        <span className="text-xl md:text-3xl font-black text-purple-800">
                            {Math.max(...graphData.map(item => item.gpa)).toFixed(2)}
                        </span>
                    </div>
                    <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-3 md:p-6 border-2 border-pink-200 shadow-lg">
                        <div className="text-lg md:text-2xl mb-1 md:mb-2">📉</div>
                        <span className="block text-xs md:text-sm font-bold text-pink-600 mb-1 md:mb-2">Lowest GPA</span>
                        <span className="text-xl md:text-3xl font-black text-pink-800">
                            {Math.min(...graphData.map(item => item.gpa)).toFixed(2)}
                        </span>
                    </div>
                    <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-3 md:p-6 border-2 border-indigo-200 shadow-lg">
                        <div className="text-lg md:text-2xl mb-1 md:mb-2">📊</div>
                        <span className="block text-xs md:text-sm font-bold text-indigo-600 mb-1 md:mb-2">Average GPA</span>
                        <span className="text-xl md:text-3xl font-black text-indigo-800">
                            {(graphData.reduce((totalGPAs, item) => totalGPAs + item.gpa, 0) / graphData.length).toFixed(2)}
                        </span>
                    </div>
                    <div className="text-center bg-white/70 backdrop-blur-sm rounded-2xl p-3 md:p-6 border-2 border-emerald-200 shadow-lg">
                        <div className="text-lg md:text-2xl mb-1 md:mb-2">📅</div>
                        <span className="block text-xs md:text-sm font-bold text-emerald-600 mb-1 md:mb-2">Semesters</span>
                        <span className="text-xl md:text-3xl font-black text-emerald-800">{graphData.length}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GPAGraph;