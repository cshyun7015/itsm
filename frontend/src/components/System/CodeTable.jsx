import React, { useState, useEffect } from 'react';

const CodeTable = () => {
  const [data, setData] = useState([]);
  
  // 🌟 페이징 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 컴포넌트 마운트 시 공통 코드 API 호출
  useEffect(() => {
    fetch('http://localhost:8080/api/system/codes')
      .then(res => res.json())
      .then(fetchedData => setData(fetchedData))
      .catch(err => console.error('공통 코드 로드 실패:', err));
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = data.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="action-bar" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: 'var(--text-main)' }}>공통 코드(Common Code) 목록</h4>
        <button className="btn btn-primary" onClick={() => alert('코드 등록 모달 예정')}>+ 신규 코드</button>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>그룹 코드</th>
              <th>코드 값</th>
              <th>코드 명 (한글)</th>
              <th>설명</th>
              <th>사용 여부</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(code => (
              <tr key={code.id}>
                <td>{code.id}</td>
                <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{code.groupCode}</td>
                <td style={{ fontWeight: '600' }}>{code.codeValue}</td>
                <td style={{ color: '#059669', fontWeight: 'bold' }}>{code.codeName}</td>
                <td style={{ color: 'var(--text-muted)' }}>{code.description}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                    backgroundColor: code.useYn === 'Y' ? '#dcfce7' : '#fee2e2',
                    color: code.useYn === 'Y' ? '#166534' : '#ef4444'
                  }}>
                    {code.useYn === 'Y' ? '사용 중' : '미사용'}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>등록된 공통 코드가 없습니다. 대시보드에서 샘플 데이터를 생성해 주세요.</td></tr>
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

export default CodeTable;