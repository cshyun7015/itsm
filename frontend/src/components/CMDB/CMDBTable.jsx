import React from 'react';

const CMDBTable = ({ data, onRowClick }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return { bg: '#dcfce7', text: '#166534' }; // 초록
      case 'IN_MAINTENANCE': return { bg: '#fef9c3', text: '#854d0e' }; // 노랑
      case 'RETIRED': return { bg: '#f1f5f9', text: '#64748b' }; // 회색
      default: return { bg: '#f8fafc', text: 'var(--text-main)' };
    }
  };

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>분류 (Type)</th>
            <th>자산명 (CI Name)</th>
            <th>IP 주소</th>
            <th>환경</th>
            <th>담당자</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {data.map(ci => (
            <tr key={ci.id} onClick={() => onRowClick && onRowClick(ci)}>
              <td>{ci.id}</td>
              <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{ci.ciType}</td>
              <td>{ci.ciName}</td>
              <td>{ci.ipAddress || '-'}</td>
              <td>{ci.environment}</td>
              <td>{ci.ownerName}</td>
              <td>
                <span style={{ 
                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold',
                  backgroundColor: getStatusColor(ci.status).bg, color: getStatusColor(ci.status).text 
                }}>
                  {ci.status}
                </span>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>등록된 구성 항목(CI)이 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CMDBTable;