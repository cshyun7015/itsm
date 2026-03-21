import React, { useState, useEffect } from 'react';

const CompanyTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch('http://localhost:8080/api/system/companies')
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('고객사 데이터 로드 실패:', err));
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div>
      <div className="action-bar" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: 'var(--text-main)' }}>고객사(Company) 목록</h4>
        <button className="btn btn-primary" onClick={() => alert('고객사 등록 모달 예정')}>+ 신규 고객사</button>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>고객사명</th>
              <th>주소</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(comp => (
              <tr key={comp.id}>
                <td>{comp.id}</td>
                <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{comp.name}</td>
                <td>{comp.address || '-'}</td>
              </tr>
            ))}
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

export default CompanyTable;