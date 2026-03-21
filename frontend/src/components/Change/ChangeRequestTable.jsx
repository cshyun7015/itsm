import React, { useState } from 'react';

const ChangeRequestTable = ({ data, onRowClick }) => {
  // 🌟 페이징 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
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
            {currentData.map(cr => (
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
                <td style={{ color: cr.status === 'CAB_APPROVAL' ? '#d97706' : cr.status === 'SCHEDULED' ? '#2563eb' : 'var(--text-main)', fontWeight: '600' }}>
                  {cr.status}
                </td>
                <td>{cr.scheduledAt ? cr.scheduledAt.split('T')[0] : '일정 미정'}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>등록된 변경 요청이 없습니다.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🌟 페이지네이션 UI */}
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

export default ChangeRequestTable;