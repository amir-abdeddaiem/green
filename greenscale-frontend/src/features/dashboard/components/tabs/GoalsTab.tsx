import { useState, useEffect } from "react";
import { Target, TrendingDown, Calendar, CheckCircle2, AlertCircle, Plus, Trash2, Edit2 } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  targetEmission: number;
  currentEmission: number;
  unit: string;
  deadline: string;
  category: string;
  status: "on-track" | "at-risk" | "achieved";
}

export function GoalsTab() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    targetEmission: "",
    currentEmission: "",
    unit: "kg CO2e",
    deadline: "",
    category: "Electricity",
  });

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem("goals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    } else {
      // Initialize with sample goals
      const sampleGoals: Goal[] = [
        {
          id: "1",
          name: "Reduce Electricity Usage",
          targetEmission: 500,
          currentEmission: 620,
          unit: "kg CO2e",
          deadline: "2025-06-30",
          category: "Electricity",
          status: "at-risk",
        },
        {
          id: "2",
          name: "Natural Gas Optimization",
          targetEmission: 200,
          currentEmission: 150,
          unit: "kg CO2e",
          deadline: "2025-12-31",
          category: "Gas",
          status: "on-track",
        },
      ];
      setGoals(sampleGoals);
      localStorage.setItem("goals", JSON.stringify(sampleGoals));
    }
  }, []);

  const calculateProgress = (target: number, current: number) => {
    if (target <= 0) return 0;
    const reduction = Math.max(0, current - target);
    return Math.min(100, (reduction / current) * 100);
  };

  const getStatus = (target: number, current: number, deadline: string): "on-track" | "at-risk" | "achieved" => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const progress = calculateProgress(target, current);

    if (current <= target) {
      return "achieved";
    }
    if (daysLeft <= 30 && progress < 50) {
      return "at-risk";
    }
    return "on-track";
  };

  const handleAddGoal = () => {
    if (!formData.name || !formData.targetEmission || !formData.deadline) {
      alert("Please fill in all required fields");
      return;
    }

    const newGoal: Goal = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      targetEmission: parseFloat(formData.targetEmission),
      currentEmission: parseFloat(formData.currentEmission) || 0,
      unit: formData.unit,
      deadline: formData.deadline,
      category: formData.category,
      status: "on-track",
    };

    let updatedGoals;
    if (editingId) {
      updatedGoals = goals.map((g) => (g.id === editingId ? newGoal : g));
      setEditingId(null);
    } else {
      updatedGoals = [...goals, newGoal];
    }

    newGoal.status = getStatus(newGoal.targetEmission, newGoal.currentEmission, newGoal.deadline);
    setGoals(updatedGoals);
    localStorage.setItem("goals", JSON.stringify(updatedGoals));

    // Reset form
    setFormData({
      name: "",
      targetEmission: "",
      currentEmission: "",
      unit: "kg CO2e",
      deadline: "",
      category: "Electricity",
    });
    setIsAddingGoal(false);
  };

  const handleEditGoal = (goal: Goal) => {
    setFormData({
      name: goal.name,
      targetEmission: goal.targetEmission.toString(),
      currentEmission: goal.currentEmission.toString(),
      unit: goal.unit,
      deadline: goal.deadline,
      category: goal.category,
    });
    setEditingId(goal.id);
    setIsAddingGoal(true);
  };

  const handleDeleteGoal = (id: string) => {
    const updatedGoals = goals.filter((g) => g.id !== id);
    setGoals(updatedGoals);
    localStorage.setItem("goals", JSON.stringify(updatedGoals));
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      targetEmission: "",
      currentEmission: "",
      unit: "kg CO2e",
      deadline: "",
      category: "Electricity",
    });
    setEditingId(null);
    setIsAddingGoal(false);
  };

  const stats = {
    totalGoals: goals.length,
    achievedGoals: goals.filter((g) => g.status === "achieved").length,
    onTrack: goals.filter((g) => g.status === "on-track").length,
    atRisk: goals.filter((g) => g.status === "at-risk").length,
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* ===== HEADER ===== */}
      <div className="px-8 py-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center border border-green-200">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Goals & Targets</h1>
              <p className="text-sm text-gray-500 mt-1">Set and track your emissions reduction goals</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddingGoal(true)}
            className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-300 flex items-center gap-2 shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Goal
          </button>
        </div>
      </div>

      {/* ===== STATS CARDS ===== */}
      <div className="grid grid-cols-4 gap-4 px-8 py-6 bg-gradient-to-b from-green-50 to-white border-b border-gray-200">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider font-bold text-gray-600">Total Goals</p>
          <p className="text-3xl font-black text-gray-900 mt-2">{stats.totalGoals}</p>
        </div>
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider font-bold text-green-700">Achieved</p>
          <p className="text-3xl font-black text-green-600 mt-2">{stats.achievedGoals}</p>
        </div>
        <div className="bg-white border border-blue-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider font-bold text-blue-700">On Track</p>
          <p className="text-3xl font-black text-blue-600 mt-2">{stats.onTrack}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-4">
          <p className="text-xs uppercase tracking-wider font-bold text-red-700">At Risk</p>
          <p className="text-3xl font-black text-red-600 mt-2">{stats.atRisk}</p>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-8 py-6 space-y-6">
          {/* Add/Edit Form */}
          {isAddingGoal && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? "Edit Goal" : "Add New Goal"}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Goal Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Reduce Electricity Usage"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-all"
                  >
                    <option>Electricity</option>
                    <option>Gas</option>
                    <option>Fuel</option>
                    <option>Waste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Emission (kg CO2e) *</label>
                  <input
                    type="number"
                    placeholder="500"
                    value={formData.targetEmission}
                    onChange={(e) => setFormData({ ...formData, targetEmission: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Current Emission (kg CO2e)</label>
                  <input
                    type="number"
                    placeholder="620"
                    value={formData.currentEmission}
                    onChange={(e) => setFormData({ ...formData, currentEmission: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Deadline *</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddGoal}
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all"
                >
                  {editingId ? "Update Goal" : "Create Goal"}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No goals yet. Create your first goal!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {goals.map((goal) => {
                const progress = calculateProgress(goal.targetEmission, goal.currentEmission);
                const status = getStatus(goal.targetEmission, goal.currentEmission, goal.deadline);
                const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={goal.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">{goal.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            status === "achieved"
                              ? "bg-green-100 text-green-700"
                              : status === "on-track"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {status === "achieved" && "✓ Achieved"}
                            {status === "on-track" && "On Track"}
                            {status === "at-risk" && "At Risk"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{goal.category}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditGoal(goal)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">Progress: {progress.toFixed(0)}%</span>
                        <span className="text-sm text-gray-600">
                          {goal.currentEmission.toFixed(0)} / {goal.targetEmission.toFixed(0)} {goal.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            progress >= 100 ? "bg-green-600" : progress >= 50 ? "bg-green-500" : "bg-yellow-500"
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-600">Deadline</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(goal.deadline).toLocaleDateString()} ({daysLeft}d)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Reduction Needed</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {Math.max(0, goal.currentEmission - goal.targetEmission).toFixed(0)} {goal.unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {status === "achieved" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <div>
                          <p className="text-xs text-gray-600">Status</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {status === "achieved" ? "Goal Met" : `${daysLeft} days left`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
