import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, DollarSign, Target, Award, XCircle } from 'lucide-react';

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  lostLeads: number;
  totalValue: number;
  wonValue: number;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ 
      width: '48px', height: '48px', borderRadius: 'var(--radius-full)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: `rgba(${color}, 0.1)`, color: `rgb(${color})`
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchDashboard();
  }, [token]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(value);
  };

  if (isLoading) return <div className="animate-fade-in">Loading dashboard...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Dashboard Overview</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>Here is what's happening with your sales pipeline today.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Total Leads" value={stats?.totalLeads || 0} icon={<Users size={24} />} color="79, 70, 229" />
        <StatCard title="New Leads" value={stats?.newLeads || 0} icon={<UserPlus size={24} />} color="59, 130, 246" />
        <StatCard title="Qualified Leads" value={stats?.qualifiedLeads || 0} icon={<Target size={24} />} color="167, 139, 250" />
        <StatCard title="Total Pipeline Value" value={formatCurrency(stats?.totalValue || 0)} icon={<DollarSign size={24} />} color="156, 163, 175" />
        <StatCard title="Won Deals" value={stats?.wonLeads || 0} icon={<Award size={24} />} color="16, 185, 129" />
        <StatCard title="Lost Deals" value={stats?.lostLeads || 0} icon={<XCircle size={24} />} color="239, 68, 68" />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          Sales Performance
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '1rem 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-success)' }}>{formatCurrency(stats?.wonValue || 0)}</div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Total Closed Won Revenue</div>
          </div>
          <div style={{ height: '60px', width: '1px', backgroundColor: 'var(--color-border)' }}></div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {stats?.totalLeads ? Math.round(((stats?.wonLeads || 0) / stats.totalLeads) * 100) : 0}%
            </div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Win Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};
