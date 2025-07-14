import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, Calendar, AlertTriangle, Check } from 'lucide-react';
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
    expiryDate: new Date().toISOString().split('T')[0],
    urgent: false,
    veryUrgent: false
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
        createdAt: new Date().toISOString(),
        urgent: formData.urgent,
        veryUrgent: formData.veryUrgent
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
      expiryDate: task.expiryDate,
      urgent: task.urgent || false,
      veryUrgent: task.veryUrgent || false
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

  const handleCompleteTask = (taskId: string) => {
    const updatedTasks = tasks.map(t =>
      t.id === taskId ? { ...t, completed: true } : t
    );
    onTasksUpdate(updatedTasks);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      registrationDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date().toISOString().split('T')[0],
      urgent: false,
      veryUrgent: false
    });
    setShowAddForm(false);
    setEditingTask(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // First, sort by completion status (incomplete first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // For incomplete tasks, sort very urgent first, then urgent, then by expiry date
    if (!a.completed && !b.completed) {
      if (a.veryUrgent !== b.veryUrgent) {
        return a.veryUrgent ? -1 : 1;
      }
      if (a.urgent !== b.urgent) {
        return a.urgent ? -1 : 1;
      }
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    }
    
    // For completed tasks, sort by expiry date
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
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="urgent"
                    checked={formData.urgent}
                    onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
                  />
                  <label htmlFor="urgent" className="text-sm font-medium text-slate-700">
                    Mark as urgent
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="very-urgent"
                    checked={formData.veryUrgent}
                    onChange={(e) => setFormData({ ...formData, veryUrgent: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                  />
                  <label htmlFor="very-urgent" className="text-sm font-medium text-slate-700">
                    Mark as very urgent
                  </label>
                </div>
              </div>
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
              : task.veryUrgent
              ? 'border-red-200 bg-red-50'
              : task.urgent
              ? 'border-orange-200 bg-orange-50'
              : isTaskOverdue(task.expiryDate, task.completed)
              ? 'border-orange-200 bg-orange-50'
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
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`urgent-edit-${task.id}`}
                      checked={formData.urgent}
                      onChange={(e) => setFormData({ ...formData, urgent: e.target.checked })}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-slate-300 rounded"
                    />
                    <label htmlFor={`urgent-edit-${task.id}`} className="text-sm font-medium text-slate-700">
                      Mark as urgent
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`very-urgent-edit-${task.id}`}
                      checked={formData.veryUrgent}
                      onChange={(e) => setFormData({ ...formData, veryUrgent: e.target.checked })}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 rounded"
                    />
                    <label htmlFor={`very-urgent-edit-${task.id}`} className="text-sm font-medium text-slate-700">
                      Mark as very urgent
                    </label>
                  </div>
                </div>
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
                      onClick={() => handleCompleteTask(task.id)}
                      className={`p-1 rounded-full transition-colors ${
                        task.completed
                          ? 'text-emerald-600 bg-emerald-100'
                          : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title="Mark as completed"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    {task.veryUrgent && !task.completed && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <AlertTriangle className="h-4 w-4 fill-current" />
                        <span className="text-xs font-medium">!</span>
                      </div>
                    )}
                    {task.urgent && !task.veryUrgent && !task.completed && (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <AlertTriangle className="h-4 w-4 fill-current" />
                        <span className="text-xs font-medium">!</span>
                      </div>
                    )}
                    <h4 className={`font-medium ${
                      task.completed ? 'text-emerald-800 line-through' : 
                      task.veryUrgent ? 'text-red-900' :
                      task.urgent ? 'text-orange-900' : 'text-slate-900'
                    }`}>
                      {task.title}
                    </h4>
                    {isTaskOverdue(task.expiryDate, task.completed) && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                        Overdue
                      </span>
                    )}
                    {task.veryUrgent && !task.completed && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                        Very Urgent
                      </span>
                    )}
                    {task.urgent && !task.veryUrgent && !task.completed && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                        Urgent
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
                  task.completed ? 'text-emerald-700' : 
                  task.veryUrgent ? 'text-red-700' :
                  task.urgent ? 'text-orange-700' : 'text-slate-700'
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