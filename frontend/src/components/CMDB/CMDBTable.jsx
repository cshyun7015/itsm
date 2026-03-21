import React, { useState } from 'react';

const CMDBTable = ({ data, onRowClick }) => {
  // 🌟 페이징 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return { bg: '#dcfce7', text: '#166534' };
      case 'IN_MAINTENANCE': return { bg: '#fef9c3', text: '#854d0e' };
      case 'RETIRED': return { bg: '#f1f5f9', text: '#64748b' };
      default: return { bg: '#f8fafc', text: 'var(--text-main)' };
    }
  };

  return (
    <div>
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
            {currentData.map(ci => (
              <tr key={ci.id} onClick={() => onRowClick && onRowClick(ci)}>
                <td>{ci.id}</td>
                <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{ci.ciType}</td>
                <td style={{ fontWeight: '500' }}>{ci.ciName}</td>
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

export default CMDBTable;