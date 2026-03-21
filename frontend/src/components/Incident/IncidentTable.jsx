import React, { useState } from 'react';

const IncidentTable = ({ data, onRowClick }) => {
  // 🌟 페이징 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 한 페이지당 보여줄 개수

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // 현재 페이지에 보여줄 데이터만 잘라내기 (slice)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return { bg: '#fee2e2', text: '#ef4444' };
      case 'IN_PROGRESS': return { bg: '#dbeafe', text: '#3b82f6' };
      case 'RESOLVED': return { bg: '#dcfce7', text: '#10b981' };
      default: return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  // 페이지 변경 핸들러
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
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
              <th>장애 발생 자산(CI)</th>
              <th>요청자</th>
              <th>상태</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            {/* 🌟 원본 data가 아닌 잘라낸 currentData를 매핑합니다 */}
            {currentData.map(incident => (
              <tr key={incident.id} onClick={() => onRowClick(incident)}>
                <td>{incident.id}</td>
                <td>
                  <span style={{ fontWeight: 'bold', color: incident.priority === 'CRITICAL' ? '#ef4444' : incident.priority === 'HIGH' ? '#f59e0b' : 'var(--text-main)' }}>
                    {incident.priority}
                  </span>
                </td>
                <td style={{ fontWeight: '500' }}>{incident.title}</td>
                <td>{incident.ciName || '-'}</td>
                <td>{incident.requesterName}</td>
                <td>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold',
                    backgroundColor: getStatusColor(incident.status).bg, color: getStatusColor(incident.status).text 
                  }}>
                    {incident.status}
                  </span>
                </td>
                <td>{new Date(incident.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>등록된 인시던트가 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🌟 하단 페이지네이션 버튼 영역 */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button 
            className="page-btn" 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            이전
          </button>
          
          {/* 동적으로 페이지 번호 버튼 생성 */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            // 너무 많으면 화면을 넘어가니, 현재 페이지 기준 앞뒤 2개씩만 보여주는 필터링 (선택적)
            .filter(page => Math.abs(currentPage - page) <= 2 || page === 1 || page === totalPages)
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {/* 1과 중간 페이지 사이에 생략표(...) 표시 */}
                {index > 0 && page - array[index - 1] > 1 && <span style={{ color: 'var(--text-muted)' }}>...</span>}
                <button 
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              </React.Fragment>
          ))}

          <button 
            className="page-btn" 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default IncidentTable;