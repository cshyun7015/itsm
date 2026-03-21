import React, { useState } from 'react';
import ServiceRequestModal from './ServiceRequestModal';

const CatalogGrid = ({ items }) => {
  const [selectedCatalog, setSelectedCatalog] = useState(null);

  return (
    <div style={{ marginTop: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {items.map((item) => (
          <div key={item.id} style={{
            backgroundColor: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)',
            padding: '1.5rem', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', boxShadow: 'var(--shadow-sm)'
          }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            
            <span style={{ alignSelf: 'flex-start', fontSize: '0.8rem', backgroundColor: '#eff6ff', color: 'var(--primary)', padding: '4px 10px', borderRadius: '20px', fontWeight: '700', marginBottom: '1rem' }}>
              {item.category}
            </span>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.2rem', color: 'var(--text-main)' }}>{item.name}</h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.5', flexGrow: 1 }}>{item.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>⏳ 소요: {item.estimatedDays}일</span>
              <button className="btn btn-primary" onClick={() => setSelectedCatalog(item)}>신청하기</button>
            </div>
          </div>
        ))}
      </div>
      {selectedCatalog && <ServiceRequestModal catalogItem={selectedCatalog} onClose={() => setSelectedCatalog(null)} />}
    </div>
  );
};

export default CatalogGrid;