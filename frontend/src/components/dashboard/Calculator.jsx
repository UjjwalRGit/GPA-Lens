import { useState } from 'react';

function Calculator({ onClose }) {
    const [categories, setCategories] = useState([
        { id: 1, name: 'Homework', weight: 15, earned: 0, total: 0},
        { id: 2, name: 'Exams', weight: 40, earned: 0, total: 0},
        { id: 3, name: 'Quizzes', weight: 20, earned: 0, total: 0},
        { id: 4, name: 'Final', weight: 25, earned: 0, total: 0}
    ]);
    const [newCategory, setNewCategory] = useState({ name: '', weight: 0 });
    const [showAddCategory, setShowAddCategory] = useState(false);

    function updateCategory(id, field, value) {
        setCategories(categories.map(category => 
            category.id === id ? {...category, [field]: parseFloat(value) || 0 } : category
        ));
    }

    function updateCategoryName(id, name) {
        setCategories(categories.map(category =>
            category.id === id ? { ...category, name } : category
        ));
    }

    function addCategory() {
        if (newCategory.name.trim() && newCategory.weight > 0) {
            const newId = Math.max(...categories.map(category => category.id)) + 1;
            setCategories([...categories, {
                id: newId,
                name: newCategory.name.trim(),
                weight: newCategory.weight,
                earned: 0,
                total: 0
            }]);
            setNewCategory({ name: '', weight: 0 });
            setShowAddCategory(false);
        } 
    }

    function removeCategory(id) {
        if (categories.length > 1) {
            setCategories(categories.filter(category => category.id !== id));
        }
    }

    function calculateGrade() {
        let current = 0;
        let weight = 0;

        categories.forEach(category => {
            if (category.total > 0) {
                const percent = (category.earned / category.total) * 100;
                current += percent * (category.weight / 100);
                weight += category.weight;
            }
        })

        if (weight === 0) {
            return 0;
        }

        return (current / weight) * 100;
    }

    function projectedGrade() {
        let projected = 0;
        let weight = categories.reduce((totalWeight, category) => totalWeight + category.weight, 0);

        categories.forEach(category => {
            if (category.total > 0) {
                const percent = (category.earned / category.total) * 100;
                projected += percent * (category.weight / 100);
            }
        })

        return weight > 0 ? projected : 0;
    }

    const currentGrade = calculateGrade();
    const projected = projectedGrade();
    const totalWeight = categories.reduce((weight, category) => weight + category.weight, 0);
    const completedWork = categories.reduce((weight, category) =>
        category.total > 0 ? weight + category.weight : weight, 0);

    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-5 font-sans">
            <div className="bg-white/95 backdrop-blur-lg border-2 border-purple-200/50 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white p-8 rounded-t-3xl flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black m-0 flex items-center gap-4">
                            🧮 Grade Calculator
                        </h2>
                        <p className="text-orange-100 mt-2 font-medium">
                            Calculate your current and projected grades with weighted categories
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white w-12 h-12 rounded-2xl text-xl cursor-pointer transition-all duration-300 flex items-center justify-center hover:bg-white/30 hover:scale-110 font-bold"
                    >
                        ❌
                    </button>
                </div>

                {/* Body */}
                <div className="p-8">
                    {/* Grade Display */}
                    <div className="mb-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Current Grade */}
                            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-8 rounded-3xl text-white text-center relative overflow-hidden shadow-xl">
                                <div className="absolute top-4 right-4 text-3xl opacity-30">📈</div>
                                <h3 className="text-purple-100 mb-4 text-lg font-bold tracking-wide">Current Grade</h3>
                                <div className="text-5xl font-black mb-3">
                                    {currentGrade.toFixed(1)}%
                                </div>
                                <small className="text-purple-200 text-sm font-medium">
                                    Based on {completedWork}% of coursework
                                </small>
                            </div>

                            {/* Projected Grade */}
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-3xl text-white text-center relative overflow-hidden shadow-xl">
                                <div className="absolute top-4 right-4 text-3xl opacity-30">🎯</div>
                                <h3 className="text-emerald-100 mb-4 text-lg font-bold tracking-wide">Projected Grade</h3>
                                <div className="text-5xl font-black mb-3">
                                    {projected.toFixed(1)}%
                                </div>
                                <small className="text-emerald-200 text-sm font-medium">
                                    If all categories completed
                                </small>
                            </div>

                            {/* Total Weight */}
                            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-8 rounded-3xl text-white text-center relative overflow-hidden shadow-xl">
                                <div className="absolute top-4 right-4 text-3xl opacity-30">⚖️</div>
                                <h3 className="text-pink-100 mb-4 text-lg font-bold tracking-wide">Total Weight</h3>
                                <div className="text-5xl font-black mb-3">
                                    {totalWeight}%
                                </div>
                                <small className="text-pink-200 text-sm font-medium">
                                    {totalWeight === 100 ? 'Perfect balance!' : 'Adjust categories'}
                                </small>
                            </div>
                        </div>

                        {/* Weight Warning */}
                        {totalWeight !== 100 && (
                            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400 text-yellow-800 px-6 py-4 rounded-2xl mb-6 flex items-center gap-4 shadow-lg">
                                <span className="text-2xl">⚠️</span>
                                <span className="font-semibold">
                                    Warning: Your category weights total {totalWeight}%. They should add up to 100% for accurate calculations.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Categories */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-2xl font-black text-purple-700">Grade Categories</h3>
                            <button
                                onClick={() => setShowAddCategory(true)}
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                ➕ Add Category
                            </button>
                        </div>

                        {categories.map(category => (
                            <div key={category.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
                                {/* Category Header */}
                                <div className="flex flex-wrap items-center gap-4 mb-6">
                                    <input
                                        type="text"
                                        value={category.name}
                                        onChange={(e) => updateCategoryName(category.id, e.target.value)}
                                        placeholder="Category Name..."
                                        className="flex-1 min-w-48 p-4 border-2 border-purple-200 rounded-xl text-base font-bold transition-all duration-300 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 bg-white"        
                                    />
                                    
                                    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border-2 border-purple-200 shadow-sm">
                                        <input
                                            type="number"
                                            value={category.weight}
                                            onChange={(e) => updateCategory(category.id, 'weight', e.target.value)}
                                            min="0"
                                            max="100"
                                            placeholder="Weight..."
                                            className="w-20 p-2 border-0 bg-transparent font-bold text-center focus:outline-none text-purple-700"
                                        />
                                        <span className="font-bold text-purple-600">%</span>
                                    </div>

                                    {categories.length > 1 && (
                                        <button
                                            onClick={() => removeCategory(category.id)}
                                            className="bg-red-100 border-2 border-red-300 rounded-xl p-3 text-lg cursor-pointer transition-all duration-300 hover:bg-red-500 hover:border-red-500 hover:text-white hover:scale-110"
                                            title="Remove Category"
                                        >
                                            🗑️
                                        </button>
                                    )}
                                </div>
                                
                                {/* Category Grade Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-bold text-purple-700 tracking-wide">Points Earned:</label>
                                        <input
                                            type="number"
                                            value={category.earned}
                                            onChange={(e) => updateCategory(category.id, 'earned', e.target.value)}
                                            min="0"
                                            placeholder="Points earned..."
                                            className="p-4 border-2 border-purple-200 rounded-xl text-base font-semibold transition-all duration-300 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 bg-white"
                                        />
                                    </div>
                                    
                                    <div className="flex flex-col gap-3">
                                        <label className="text-sm font-bold text-purple-700 tracking-wide">Total Points:</label>
                                        <input
                                            type="number"
                                            value={category.total}
                                            onChange={(e) => updateCategory(category.id, 'total', e.target.value)}
                                            min="0"
                                            placeholder="Total possible..."
                                            className="p-4 border-2 border-purple-200 rounded-xl text-base font-semibold transition-all duration-300 focus:outline-none focus:border-purple-500 focus:shadow-lg focus:shadow-purple-200 bg-white"
                                        />
                                    </div>
                                    
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white text-center shadow-lg">
                                        <div className="text-sm font-bold mb-1">Category Grade</div>
                                        <div className="text-2xl font-black">
                                            {category.total > 0 ? ((category.earned / category.total) * 100).toFixed(1) : '0.0'}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Category Form */}
                        {showAddCategory && (
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-lg">
                                <h4 className="text-xl font-bold text-emerald-700 mb-4">Add New Category</h4>
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="flex-1 min-w-48">
                                        <label className="block text-sm font-bold text-emerald-700 mb-2">Category Name:</label>
                                        <input
                                            type="text"
                                            value={newCategory.name}
                                            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                                            placeholder="e.g., Projects"
                                            className="w-full p-4 border-2 border-emerald-200 rounded-xl text-base font-semibold transition-all duration-300 focus:outline-none focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-200 bg-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-emerald-700 mb-2">Weight (%):</label>
                                        <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border-2 border-emerald-200 shadow-sm">
                                            <input
                                                type="number"
                                                value={newCategory.weight}
                                                onChange={(e) => setNewCategory({...newCategory, weight: parseFloat(e.target.value)})}
                                                min="0"
                                                max="100"
                                                placeholder="Weight..."
                                                className="w-20 p-2 border-0 bg-transparent font-bold text-center focus:outline-none text-emerald-700"
                                            />
                                            <span className="font-bold text-emerald-600">%</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={addCategory}
                                            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowAddCategory(false);
                                                setNewCategory({name: '', weight: 0});
                                            }}
                                            className="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-bold transition-all duration-300 hover:from-gray-600 hover:to-gray-700"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Calculator;