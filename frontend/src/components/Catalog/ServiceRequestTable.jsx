import React, { useState } from 'react';

const ServiceRequestTable = ({ data, onRowClick }) => {
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
              <th>카탈로그</th>
              <th>요청 제목</th>
              <th>요청자</th>
              <th>상태</th>
              <th>희망 완료일</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(req => (
              <tr key={req.id} onClick={() => onRowClick(req)}>
                <td>{req.id}</td>
                <td>
                  <span style={{ backgroundColor: '#eff6ff', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {req.catalog ? req.catalog.name : '기타'}
                  </span>
                </td>
                <td style={{ fontWeight: '500' }}>{req.title}</td>
                <td>{req.requesterName}</td>
                <td style={{ color: req.approvalStatus === 'PENDING' ? '#f59e0b' : req.approvalStatus === 'APPROVED' ? '#10b981' : 'var(--text-main)', fontWeight: 'bold' }}>
                  {req.approvalStatus}
                </td>
                <td>{req.targetDeliveryDate || '미지정'}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>등록된 서비스 요청이 없습니다.</td></tr>
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

export default ServiceRequestTable;