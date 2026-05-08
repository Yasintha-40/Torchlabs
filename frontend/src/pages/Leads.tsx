import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit2, Trash2, MessageSquare, X, Send } from 'lucide-react';

interface Note {
  id: number;
  content: string;
  created_by: string;
  created_at: string;
}

interface Lead {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  source: string;
  assigned_to: string;
  status: string;
  deal_value: number;
  created_at: string;
  updated_at: string;
  notes?: Note[];
}

const statusColors: Record<string, string> = {
  'New': 'badge-new',
  'Contacted': 'badge-contacted',
  'Qualified': 'badge-qualified',
  'Proposal Sent': 'badge-proposal',
  'Won': 'badge-won',
  'Lost': 'badge-lost',
};

export const Leads: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterAssignedTo, setFilterAssignedTo] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [newNote, setNewNote] = useState('');
  const { token } = useAuth();
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', company: '', email: '', phone: '', source: 'Website', assigned_to: '', status: 'New', deal_value: 0
  });

  const fetchLeads = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/leads', {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, status: filterStatus, source: filterSource }
      });
      // Filter assigned_to on frontend if backend doesn't support it directly, or assume backend ignores it.
      // Actually backend only supports status, source, search. Let's filter assigned_to on frontend for simplicity:
      let fetchedLeads = response.data as Lead[];
      if (filterAssignedTo) {
        fetchedLeads = fetchedLeads.filter(l => l.assigned_to.toLowerCase().includes(filterAssignedTo.toLowerCase()));
      }
      setLeads(fetchedLeads);
    } catch (err) {
      console.error('Failed to fetch leads');
    }
  };

  useEffect(() => {
    if (token) fetchLeads();
  }, [token, search, filterStatus, filterSource, filterAssignedTo]);

  const openModal = async (lead?: Lead) => {
    if (lead) {
      try {
        // Fetch full lead details including notes
        const response = await axios.get(`http://localhost:5000/api/leads/${lead.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fullLead = response.data;
        setEditingLead(fullLead);
        setFormData({
          name: fullLead.name, company: fullLead.company, email: fullLead.email, phone: fullLead.phone,
          source: fullLead.source, assigned_to: fullLead.assigned_to, status: fullLead.status, deal_value: fullLead.deal_value
        });
      } catch (err) {
        console.error('Failed to fetch lead details');
      }
    } else {
      setEditingLead(null);
      setFormData({ name: '', company: '', email: '', phone: '', source: 'Website', assigned_to: '', status: 'New', deal_value: 0 });
    }
    setNewNote('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLead) {
        await axios.put(`http://localhost:5000/api/leads/${editingLead.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post('http://localhost:5000/api/leads', formData, { headers: { Authorization: `Bearer ${token}` } });
      }
      setIsModalOpen(false);
      fetchLeads();
    } catch (err) {
      console.error('Failed to save lead');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/leads/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchLeads();
    } catch (err) {
      console.error('Failed to delete lead');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !editingLead) return;
    try {
      await axios.post(`http://localhost:5000/api/leads/${editingLead.id}/notes`, { content: newNote }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewNote('');
      // Refresh the modal data
      openModal(editingLead);
    } catch (err) {
      console.error('Failed to add note');
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(value);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Leads Management</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Track and manage your potential customers.</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add New Lead
        </button>
      </div>

      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search by name, company or email..." 
            className="input-field"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <input 
          type="text"
          placeholder="Filter by Salesperson..."
          className="input-field"
          style={{ minWidth: '150px' }}
          value={filterAssignedTo}
          onChange={(e) => setFilterAssignedTo(e.target.value)}
        />
        
        <select 
          className="input-field" 
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="">All Sources</option>
          <option value="Website">Website</option>
          <option value="Referral">Referral</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Cold Email">Cold Email</option>
          <option value="Event">Event</option>
        </select>

        <select 
          className="input-field" 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal Sent">Proposal Sent</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Lead Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Contact</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Value</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No leads found. Create your first lead to get started.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 500 }}>{lead.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{lead.company}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontSize: '0.875rem' }}>{lead.email}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{lead.phone}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge ${statusColors[lead.status] || 'badge-new'}`}>{lead.status}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{formatCurrency(lead.deal_value)}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openModal(lead)} style={{ padding: '0.5rem', color: 'var(--color-info)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(lead.id)} style={{ padding: '0.5rem', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', margin: '1rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{editingLead ? 'Lead Details' : 'Add New Lead'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--color-text-muted)' }}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', flexDirection: editingLead ? 'row' : 'column' }}>
              {/* Left Side: Form */}
              <div style={{ flex: 1 }}>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Name *</label>
                    <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Company</label>
                    <input type="text" className="input-field" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email</label>
                    <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Phone</label>
                    <input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Status</label>
                    <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Estimated Value (Rs)</label>
                    <input type="number" className="input-field" value={formData.deal_value} onChange={e => setFormData({...formData, deal_value: Number(e.target.value)})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Source</label>
                    <select className="input-field" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Cold Email">Cold Email</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Assigned Salesperson</label>
                    <input type="text" className="input-field" placeholder="e.g. Jane Doe" value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})} />
                  </div>
                  
                  {editingLead && (
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                      <div><strong>Created:</strong> {new Date(editingLead.created_at).toLocaleString()}</div>
                      <div><strong>Updated:</strong> {new Date(editingLead.updated_at).toLocaleString()}</div>
                    </div>
                  )}
                  
                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-start', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                    <button type="submit" className="btn btn-primary">{editingLead ? 'Save Lead Changes' : 'Create Lead'}</button>
                  </div>
                </form>
              </div>

              {/* Right Side: Notes Timeline (Only if editing an existing lead) */}
              {editingLead && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--color-border)', paddingLeft: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={18} /> Notes Activity
                  </h3>
                  
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem', maxHeight: '350px', paddingRight: '0.5rem' }}>
                    {(!editingLead.notes || editingLead.notes.length === 0) ? (
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>No notes added yet.</div>
                    ) : (
                      editingLead.notes.map(note => (
                        <div key={note.id} style={{ backgroundColor: 'var(--color-bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>{note.content}</p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <span>By: {note.created_by.split('@')[0]}</span>
                            <span>{new Date(note.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    <textarea 
                      className="input-field" 
                      style={{ width: '100%', minHeight: '80px', resize: 'none', marginBottom: '0.5rem' }} 
                      placeholder="Add a new note..."
                      value={newNote}
                      onChange={e => setNewNote(e.target.value)}
                    />
                    <button 
                      className="btn btn-secondary" 
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                    >
                      <Send size={16} /> Post Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
