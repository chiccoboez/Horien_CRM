import React, { useState } from 'react';
import { Plus, Edit2, Trash2, User, Mail, Phone, Briefcase } from 'lucide-react';
import { Contact } from '../types';

interface ContactsSectionProps {
  contacts: Contact[];
  onContactsUpdate: (contacts: Contact[]) => void;
  isEditing: boolean;
}

export const ContactsSection: React.FC<ContactsSectionProps> = ({
  contacts,
  onContactsUpdate,
  isEditing
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ''
  });

  const handleAddContact = () => {
    if (formData.name.trim()) {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      };
      onContactsUpdate([...contacts, newContact]);
      setFormData({ name: '', email: '', phone: '', role: '' });
      setShowAddForm(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      role: contact.role
    });
  };

  const handleUpdateContact = () => {
    if (editingContact && formData.name.trim()) {
      const updatedContacts = contacts.map(c =>
        c.id === editingContact.id
          ? { ...editingContact, ...formData }
          : c
      );
      onContactsUpdate(updatedContacts);
      setEditingContact(null);
      setFormData({ name: '', email: '', phone: '', role: '' });
    }
  };

  const handleDeleteContact = (contactId: string) => {
    onContactsUpdate(contacts.filter(c => c.id !== contactId));
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', role: '' });
    setShowAddForm(false);
    setEditingContact(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Contacts</span>
        </h2>
        {isEditing && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Contact</span>
          </button>
        )}
      </div>

      {contacts.length === 0 && !showAddForm && (
        <p className="text-slate-500 text-center py-4">No contacts added yet</p>
      )}

      <div className="space-y-4">
        {contacts.map((contact) => (
          <div key={contact.id} className="border border-slate-200 rounded-lg p-4">
            {editingContact?.id === contact.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateContact}
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
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{contact.name}</h4>
                  <div className="mt-1 space-y-1">
                    {contact.email && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Mail className="h-4 w-4" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Phone className="h-4 w-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.role && (
                      <div className="flex items-center space-x-2 text-sm text-slate-600">
                        <Briefcase className="h-4 w-4" />
                        <span>{contact.role}</span>
                      </div>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditContact(contact)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {showAddForm && (
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h4 className="font-medium text-slate-900 mb-3">Add New Contact</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleAddContact}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Add Contact
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
      </div>
    </div>
  );
};