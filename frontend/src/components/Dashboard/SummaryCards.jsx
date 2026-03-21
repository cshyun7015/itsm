import React from 'react';

const SummaryCards = ({ data }) => {
  const cards = [
    { label: '오픈된 장애', value: data?.openIncidents || 0, color: '#ef4444' },
    { label: '처리 중인 작업', value: data?.inProgressIncidents || 0, color: '#3b82f6' },
    { label: '승인 대기 요청', value: data?.pendingRequests || 0, color: '#f59e0b' },
    { label: '관리 고객사', value: data?.totalCompanies || 0, color: '#10b981' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
      {cards.map((card, index) => (
        <div key={index} style={{
          backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)', borderLeft: `5px solid ${card.color}`,
          display: 'flex', flexDirection: 'column', gap: '0.5rem'
        }}>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: '600' }}>{card.label}</span>
          <span style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{card.value}</span>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;