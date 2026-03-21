import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

const ProblemTable = () => {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // 💡 주소는 백엔드 API 설계에 맞게 확인해주세요! (예: /problems 또는 /api/problems)
    apiFetch('/problems')
      .then(res => {
        // 🌟 안전장치: 응답이 실패했거나, 바디가 비어있으면(204 No Content 등) 에러로 처리!
        if (!res.ok) {
          throw new Error(`서버 에러 발생! 상태 코드: ${res.status}`);
        }
        return res.text(); // 일단 텍스트로 받습니다!
      })
      .then(text => {
        // 🌟 텍스트가 비어있으면 빈 배열을 넣고, 값이 있으면 JSON으로 변환합니다.
        return text ? JSON.parse(text) : [];
      })
      .then(data => setData(data))
      .catch(err => {
        console.error('문제 데이터 로드 실패:', err);
        setData([]); // 에러가 나면 빈 배열로 초기화해서 화면이 안 깨지게 보호!
      });
  }, []);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  // 문제 관리 상태에 따른 색상 (KNOWN_ERROR 추가)
  const getStatusStyle = (status) => {
    switch(status) {
      case 'OPEN': return { bg: '#fee2e2', text: '#ef4444', label: '신규 접수' };
      case 'INVESTIGATING': return { bg: '#dbeafe', text: '#3b82f6', label: '원인 분석 중' };
      case 'KNOWN_ERROR': return { bg: '#fef3c7', text: '#d97706', label: '알려진 오류(KE)' };
      case 'RESOLVED': return { bg: '#dcfce7', text: '#10b981', label: '영구 해결됨' };
      default: return { bg: '#f1f5f9', text: '#64748b', label: status };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dateString.split('T')[0];
  };

  return (
    <div>
      <div className="action-bar" style={{ padding: '1rem', marginBottom: '1rem', borderBottom: '2px solid var(--border-light)' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
          🧩 문제 관리 (Problem Management)
        </h3>
        <button className="btn btn-primary" onClick={() => alert('신규 문제 등록 모달 예정')}>+ 신규 문제 등록</button>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>상태</th>
              <th style={{ width: '25%' }}>문제 제목 (현상)</th>
              <th>우선순위</th>
              <th>임시 해결책 (Workaround)</th>
              <th>근본 원인 (Root Cause)</th>
              <th>등록일</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map(prob => {
              const statusStyle = getStatusStyle(prob.status);
              return (
                <tr key={prob.id}>
                  <td>PRB-{prob.id}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                      backgroundColor: statusStyle.bg, color: statusStyle.text 
                    }}>
                      {statusStyle.label}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{prob.title}</td>
                  <td style={{ fontWeight: 'bold', color: prob.priority === 'CRITICAL' ? '#ef4444' : 'var(--text-muted)' }}>
                    {prob.priority}
                  </td>
                  
                  {/* 임시 해결책(Workaround) 존재 여부 표시 */}
                  <td>
                    {prob.workaround ? (
                      <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: '500' }}>💡 가이드 있음</span>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>-</span>
                    )}
                  </td>
                  
                  {/* 근본 원인(Root Cause) 존재 여부 표시 */}
                  <td>
                    {prob.rootCause ? (
                      <span style={{ color: '#4f46e5', fontSize: '0.9rem', fontWeight: '500' }}>🔍 파악 완료</span>
                    ) : (
                      <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>분석 중...</span>
                    )}
                  </td>
                  
                  <td style={{ fontSize: '0.9rem' }}>{formatDate(prob.createdAt)}</td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>등록된 문제(Problem) 데이터가 없습니다.</td></tr>
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

export default ProblemTable;