import React from 'react';

const ServiceRequestTable = ({ data, onRowClick }) => {
  
  // 상태별 색상 지정을 위한 헬퍼 함수
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#f39c12';   // 주황 (대기)
      case 'APPROVED': return '#27ae60';  // 초록 (승인)
      case 'REJECTED': return '#e74c3c';  // 빨강 (반려)
      default: return '#333';
    }
  };

  // 테이블 헤더 스타일
  const thStyle = { 
    padding: '12px', 
    textAlign: 'left', 
    fontSize: '0.9rem', 
    color: '#444',
    borderBottom: '2px solid #dee2e6' 
  };

  // 테이블 셀 스타일
  const tdStyle = { 
    padding: '12px', 
    fontSize: '0.9rem',
    borderBottom: '1px solid #eee' 
  };

  return (
    <div style={{ marginTop: '20px', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>서비스 항목</th>
            <th style={thStyle}>제목</th>
            <th style={thStyle}>요청자</th>
            <th style={thStyle}>승인 상태</th>
            <th style={thStyle}>희망 완료일</th>
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((req) => (
              <tr 
                key={req.id} 
                onClick={() => onRowClick(req)} 
                style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={tdStyle}>{req.id}</td>
                <td style={tdStyle}>{req.catalog?.name || '-'}</td>
                <td style={tdStyle}>{req.title}</td>
                <td style={tdStyle}>{req.requesterName}</td>
                <td style={{ ...tdStyle, fontWeight: 'bold', color: getStatusColor(req.approvalStatus) }}>
                  {req.approvalStatus}
                </td>
                <td style={tdStyle}>{req.targetDeliveryDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                신청 내역이 존재하지 않습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ServiceRequestTable;