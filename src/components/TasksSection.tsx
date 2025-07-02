import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, Calendar } from 'lucide-react';
import { Task } from '../types';

interface TasksSectionProps {
  tasks: Task[];
  onTasksUpdate: (tasks: Task[]) => void;
  isEditing: boolean;
}

export const TasksSection: React.FC<TasksSectionProps> = ({
  tasks,
  onTasksUpdate,
  isEditing
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    registrationDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date().toISOString().split('T')[0]
  });

  const handleAddTask = () => {
    if (formData.title.trim() && formData.description.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        registrationDate: formData.registrationDate,
        expiryDate: formData.expiryDate,
        completed: false,
        createdAt: new Date().toISOString()
      };
      onTasksUpdate([newTask, ...tasks]);
      resetForm();
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      registrationDate: task.registrationDate,
      expiryDate: task.expiryDate
    });
  };

  const handleUpdateTask = () => {
    if (editingTask && formData.title.trim() && formData.description.trim()) {
      const updatedTasks = tasks.map(t =>
        t.id === editingTask.id
          ? { ...editingTask, ...formData }
          : t
      );
      onTasksUpdate(updatedTasks);
      setEditingTask(null);
      resetForm();
    }
  };

  const handleDeleteTask = (taskId: string) => {
    onTasksUpdate(tasks.filter(t => t.id !== taskId));
  };

  const handleToggleComplete = (taskId: string) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onTasksUpdate(updatedTasks);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      registrationDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
    setEditingTask(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
  });

  const isTaskOverdue = (expiryDate: string, completed: boolean) => {
    if (completed) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Tasks</span>
        </h2>
        {isEditing && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {sortedTasks.length === 0 && !showAddForm && (
        <p className="text-slate-500 text-center py-4">No tasks added yet</p>
      )}

      <div className="space-y-4">
        {showAddForm && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="font-medium text-slate-900 mb-3">Add New Task</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Task title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Registration Date</label>
                  <input
                    type="date"
                    value={formData.registrationDate}
                    onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              <textarea
                placeholder="Task description *"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleAddTask}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                >
                  Add Task
                </button>
                <button
                  onClick={resetForm}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {sortedTasks.map((task) => (
          <div key={task.id} className={`border rounded-lg p-4 ${
            task.completed 
              ? 'border-emerald-200 bg-emerald-50' 
              : isTaskOverdue(task.expiryDate, task.completed)
              ? 'border-red-200 bg-red-50'
              : 'border-slate-200'
          }`}>
            {editingTask?.id === task.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Task title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Registration Date</label>
                    <input
                      type="date"
                      value={formData.registrationDate}
                      onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <textarea
                  placeholder="Task description *"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateTask}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`p-1 rounded-full transition-colors ${
                        task.completed
                          ? 'text-emerald-600 bg-emerald-100'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <h4 className={`font-medium ${
                      task.completed ? 'text-emerald-800 line-through' : 'text-slate-900'
                    }`}>
                      {task.title}
                    </h4>
                    {isTaskOverdue(task.expiryDate, task.completed) && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Overdue
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Registered: {new Date(task.registrationDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    <span>Due: {new Date(task.expiryDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className={`text-sm whitespace-pre-wrap ${
                  task.completed ? 'text-emerald-700' : 'text-slate-700'
                }`}>
                  {task.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};