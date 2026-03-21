import React from 'react';

const IncidentTable = ({ data, onRowClick }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
          <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>고객사</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>제목</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>요청자</th>
          <th style={{ padding: '12px', textAlign: 'left' }}>상태</th>
        </tr>
      </thead>
      <tbody>
        {data.map((t) => (
          <tr 
            key={t.id} 
            onClick={() => onRowClick(t)} 
            style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f1f1'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <td style={{ padding: '12px' }}>{t.id}</td>
            <td style={{ padding: '12px' }}>{t.company?.name}</td>
            <td style={{ padding: '12px' }}>{t.title}</td>
            <td style={{ padding: '12px' }}>{t.requesterName}</td>
            <td style={{ 
              padding: '12px', 
              fontWeight: 'bold', 
              color: t.status === 'OPEN' ? 'red' : t.status === 'RESOLVED' ? 'blue' : '#28a745' 
            }}>
              {t.status}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default IncidentTable;