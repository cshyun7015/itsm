import React, { useState, useEffect } from 'react';

const ReleaseTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch('http://localhost:8080/api/releases')
      .then(res => res.json())
      .then(fetchedData => {
        // 최신 버전/날짜 순 정렬
        const sortedData = fetchedData.sort((a, b) => b.id - a.id);
        setData(sortedData);
      })
      .catch(err => console.error('배포 데이터 로드 실패:', err));
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  // 상태별 뱃지 스타일
  const getStatusStyle = (status) => {
    switch(status) {
      case 'PLANNING': return { bg: '#f1f5f9', text: '#64748b', label: '계획 중' };
      case 'BUILDING': return { bg: '#e0f2fe', text: '#0284c7', label: '빌드 중 ⚙️' };
      case 'TESTING': return { bg: '#fef3c7', text: '#d97706', label: '테스트 중 🧪' };
      case 'DEPLOYING': return { bg: '#dbeafe', text: '#2563eb', label: '배포 진행 중 🚀' };
      case 'COMPLETED': return { bg: '#dcfce7', text: '#10b981', label: '배포 완료 ✅' };
      case 'FAILED': return { bg: '#fee2e2', text: '#ef4444', label: '롤백/실패 🚨' };
      default: return { bg: '#f1f5f9', text: '#64748b', label: status };
    }
  };

  const getTypeStyle = (type) => {
    switch(type) {
      case 'MAJOR': return { color: '#ef4444', border: '1px solid #ef4444' };
      case 'MINOR': return { color: '#3b82f6', border: '1px solid #3b82f6' };
      case 'EMERGENCY': return { color: 'white', backgroundColor: '#ef4444' };
      default: return { color: 'var(--text-muted)', border: '1px solid var(--border-light)' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dateString.replace('T', ' ').substring(0, 16);
  };

  return (
    <div>
      <div className="action-bar" style={{ padding: '1rem', marginBottom: '1rem', borderBottom: '2px solid var(--border-light)' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
          🚀 시스템 배포 관리 (Release Management)
        </h3>
        <button className="btn btn-primary" onClick={() => alert('신규 배포 계획 등록 모달 예정')}>+ 신규 배포 계획</button>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>버전</th>
              <th>유형</th>
              <th style={{ width: '25%' }}>배포 명칭</th>
              <th>상태</th>
              <th>담당자</th>
              <th>배포 예정 일시</th>
              <th>실제 완료 일시</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(rel => {
              const statusStyle = getStatusStyle(rel.status);
              const typeStyle = getTypeStyle(rel.releaseType);
              return (
                <tr key={rel.id}>
                  <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--primary)' }}>{rel.version}</td>
                  <td>
                    <span style={{ 
                      padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                      ...typeStyle 
                    }}>
                      {rel.releaseType}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{rel.title}</td>
                  <td>
                    <span style={{ 
                      padding: '6px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                      backgroundColor: statusStyle.bg, color: statusStyle.text 
                    }}>
                      {statusStyle.label}
                    </span>
                  </td>
                  <td>{rel.managerName}</td>
                  <td style={{ fontSize: '0.9rem' }}>{formatDate(rel.targetDate)}</td>
                  <td style={{ fontSize: '0.9rem', fontWeight: rel.actualDate ? 'bold' : 'normal', color: rel.status === 'FAILED' ? '#ef4444' : 'var(--text-main)' }}>
                    {formatDate(rel.actualDate)}
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>등록된 배포(Release) 계획이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
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

export default ReleaseTable;