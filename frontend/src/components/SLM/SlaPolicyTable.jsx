import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

const SlaPolicyTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // 🌟 2. fetch 대신 apiFetch를 사용하고 주소를 간결하게 줄입니다!
    apiFetch('/slm/policies')
      .then(res => {
        if (!res.ok) throw new Error('SLA 정책 로드 실패');
        return res.json();
      })
      .then(setData)
      .catch(err => console.error('SLA 정책 데이터 로드 실패:', err));
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  // 대상(Target)에 따른 뱃지 색상
  const getTargetColor = (type) => {
    if (type === 'INCIDENT') return { bg: '#fee2e2', text: '#ef4444' }; // 빨강
    if (type === 'SERVICE_REQUEST') return { bg: '#dbeafe', text: '#3b82f6' }; // 파랑
    return { bg: '#f1f5f9', text: '#64748b' };
  };

  // 우선순위에 따른 텍스트 색상
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITICAL': return '#ef4444';
      case 'HIGH': return '#f59e0b';
      case 'MEDIUM': return '#10b981';
      default: return 'var(--text-main)';
    }
  };

  return (
    <div>
      <div className="action-bar" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)' }}>SLA (서비스 수준 협약) 정책 관리</h3>
        <button className="btn btn-primary" onClick={() => alert('SLA 정책 등록 모달 예정')}>+ 신규 SLA 정책</button>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>적용 대상</th>
              <th>SLA 정책명</th>
              <th>우선순위 조건</th>
              <th>목표 해결 시간</th>
              <th>설명</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(policy => (
              <tr key={policy.id}>
                <td>{policy.id}</td>
                <td>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                    backgroundColor: getTargetColor(policy.targetType).bg, 
                    color: getTargetColor(policy.targetType).text 
                  }}>
                    {policy.targetType === 'INCIDENT' ? '장애 (Incident)' : '서비스 요청 (SR)'}
                  </span>
                </td>
                <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{policy.policyName}</td>
                <td style={{ fontWeight: 'bold', color: getPriorityColor(policy.priority) }}>
                  {policy.priority}
                </td>
                <td style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  ⏳ {policy.targetResolutionHours} 시간
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{policy.description}</td>
                <td>
                  {policy.active 
                    ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ 활성</span> 
                    : <span style={{ color: '#64748b' }}>❌ 비활성</span>}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>등록된 SLA 정책이 없습니다.</td></tr>
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

export default SlaPolicyTable;