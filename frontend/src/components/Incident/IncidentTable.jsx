import React, { useState } from 'react';

const IncidentTable = ({ data, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return { bg: '#fee2e2', text: '#ef4444' };
      case 'IN_PROGRESS': return { bg: '#dbeafe', text: '#3b82f6' };
      case 'RESOLVED': return { bg: '#dcfce7', text: '#10b981' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  // 🌟 날짜 포맷팅 함수 (YYYY-MM-DD HH:mm)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dateString.replace('T', ' ').substring(0, 16);
  };

  return (
    <div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>우선순위</th>
              <th>제목</th>
              <th>상태</th>
              {/* 🌟 새로 추가된 SLA 기한 컬럼 */}
              <th>SLA 기한 및 상태</th>
              <th>등록일시</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(incident => (
              <tr key={incident.id} onClick={() => onRowClick(incident)}>
                <td>{incident.id}</td>
                <td>
                  <span style={{ fontWeight: 'bold', color: incident.priority === 'CRITICAL' ? '#ef4444' : incident.priority === 'HIGH' ? '#f59e0b' : 'var(--text-main)' }}>
                    {incident.priority}
                  </span>
                </td>
                <td style={{ fontWeight: '500' }}>{incident.title}</td>
                <td>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold',
                    backgroundColor: getStatusColor(incident.status).bg, color: getStatusColor(incident.status).text 
                  }}>
                    {incident.status}
                  </span>
                </td>
                
                {/* 🌟 SLA 기한 및 위반 여부 표시 영역 */}
                <td>
                  {incident.targetResolutionTime ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ 
                        fontSize: '0.85rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', width: 'fit-content',
                        backgroundColor: incident.status === 'RESOLVED' ? '#f1f5f9' : (incident.slaBreached ? '#fee2e2' : '#dcfce7'),
                        color: incident.status === 'RESOLVED' ? '#64748b' : (incident.slaBreached ? '#ef4444' : '#166534')
                      }}>
                        {incident.status === 'RESOLVED' ? '✅ 해결 완료' : (incident.slaBreached ? '🚨 기한 초과 (Breach)' : '⏳ 정상 진행 중')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        목표: {formatDate(incident.targetResolutionTime)}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>정책 없음</span>
                  )}
                </td>

                <td style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {formatDate(incident.createdAt)}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>등록된 인시던트가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          <button className="page-btn" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => Math.abs(currentPage - page) <= 2 || page === 1 || page === totalPages)
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && page - array[index - 1] > 1 && <span style={{ color: 'var(--text-muted)' }}>...</span>}
                <button className={`page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => handlePageChange(page)}>{page}</button>
              </React.Fragment>
          ))}
          <button className="page-btn" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>다음</button>
        </div>
      )}
    </div>
  );
};

export default IncidentTable;