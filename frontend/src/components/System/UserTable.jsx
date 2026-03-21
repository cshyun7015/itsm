import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

const UserTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // 🌟 2. fetch 대신 apiFetch를 사용하고 URL 앞부분(/api)을 생략합니다.
    apiFetch('/system/users')
      .then(res => {
        if (!res.ok) throw new Error('사용자 로드 실패');
        return res.json();
      })
      .then(setData)
      .catch(err => console.error('사용자 데이터 로드 실패:', err));
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <div>
      <div className="action-bar" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0, color: 'var(--text-main)' }}>사용자(User) 목록</h4>
        <button className="btn btn-primary" onClick={() => alert('사용자 등록 모달 예정')}>+ 신규 사용자</button>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>로그인 ID</th>
              <th>이름</th>
              <th>부서</th>
              <th>권한 (Role)</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td style={{ fontWeight: 'bold' }}>{user.loginId}</td>
                <td>{user.name}</td>
                <td>{user.department}</td>
                <td>
                  <span style={{ 
                    color: user.role === 'ADMIN' ? '#ef4444' : user.role === 'ENGINEER' ? '#3b82f6' : 'var(--text-main)', 
                    fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px',
                    backgroundColor: user.role === 'ADMIN' ? '#fee2e2' : user.role === 'ENGINEER' ? '#dbeafe' : '#f1f5f9'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td>
                  {user.status === 'ACTIVE' 
                    ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ 정상</span> 
                    : <span style={{ color: '#64748b' }}>❌ 정지</span>}
                </td>
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

export default UserTable;