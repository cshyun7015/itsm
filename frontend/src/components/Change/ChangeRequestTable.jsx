import React from 'react';

const ChangeRequestTable = ({ data, onRowClick }) => {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>위험도</th>
            <th>변경 제목</th>
            <th>요청자</th>
            <th>상태</th>
            <th>예정일</th>
          </tr>
        </thead>
        <tbody>
          {data.map(cr => (
            <tr key={cr.id} onClick={() => onRowClick(cr)}>
              <td>{cr.id}</td>
              <td>
                <span style={{ 
                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold',
                  backgroundColor: cr.riskLevel === 'HIGH' ? '#fee2e2' : '#f1f5f9', 
                  color: cr.riskLevel === 'HIGH' ? '#ef4444' : '#64748b' 
                }}>
                  {cr.riskLevel}
                </span>
              </td>
              <td style={{ fontWeight: '500' }}>{cr.title}</td>
              <td>{cr.requesterName}</td>
              <td style={{ color: cr.status === 'CAB_APPROVAL' ? '#f59e0b' : 'var(--text-main)', fontWeight: '600' }}>{cr.status}</td>
              <td>{cr.scheduledAt || '일정 미정'}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>등록된 변경 요청이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ChangeRequestTable;