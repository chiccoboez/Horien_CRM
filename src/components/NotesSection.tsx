import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FileText, Calendar } from 'lucide-react';
import { Note } from '../types';

interface NotesSectionProps {
  notes: Note[];
  onNotesUpdate: (notes: Note[]) => void;
  isEditing: boolean;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  onNotesUpdate,
  isEditing
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddNote = () => {
    if (formData.title.trim() && formData.content.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: formData.title,
        content: formData.content,
        date: formData.date,
        createdAt: new Date().toISOString()
      };
      onNotesUpdate([newNote, ...notes]);
      setFormData({ title: '', content: '', date: new Date().toISOString().split('T')[0] });
      setShowAddForm(false);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      date: note.date
    });
  };

  const handleUpdateNote = () => {
    if (editingNote && formData.title.trim() && formData.content.trim()) {
      const updatedNotes = notes.map(n =>
        n.id === editingNote.id
          ? { ...editingNote, ...formData }
          : n
      );
      onNotesUpdate(updatedNotes);
      setEditingNote(null);
      setFormData({ title: '', content: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    onNotesUpdate(notes.filter(n => n.id !== noteId));
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', date: new Date().toISOString().split('T')[0] });
    setShowAddForm(false);
    setEditingNote(null);
  };

  const sortedNotes = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Customer Notes</span>
        </h2>
        {isEditing && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Note</span>
          </button>
        )}
      </div>

      {sortedNotes.length === 0 && !showAddForm && (
        <p className="text-slate-500 text-center py-4">No notes added yet</p>
      )}

      <div className="space-y-4">
        {showAddForm && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="font-medium text-slate-900 mb-3">Add New Note</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Note title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Note content *"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleAddNote}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Add Note
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

        {sortedNotes.map((note) => (
          <div key={note.id} className="border border-slate-200 rounded-lg p-4">
            {editingNote?.id === note.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Note title *"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <textarea
                  placeholder="Note content *"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateNote}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
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
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-slate-900">{note.title}</h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-sm text-slate-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(note.date).toLocaleDateString()}</span>
                    </div>
                    {isEditing && (
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-slate-700 whitespace-pre-wrap">{note.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};