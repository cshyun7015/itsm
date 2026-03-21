import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api'; // 🌟 1. 403 에러 방지를 위해 apiFetch 임포트!

const EventConsole = () => {
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 관제 화면이므로 조금 더 많이(12개씩) 보여줍니다.

  // API 호출하여 이벤트 목록 가져오기
  const fetchEvents = () => {
    // 🌟 2. 기본 fetch 대신 apiFetch 사용
    apiFetch('/webhook/events')
      .then(res => res.json())
      .then(data => {
        const sortedData = data.sort((a, b) => b.id - a.id);
        setEvents(sortedData);
      })
      .catch(err => console.error('이벤트 로드 실패:', err));
  };

  useEffect(() => {
    fetchEvents();
    // 실제 관제 센터처럼 10초마다 자동으로 새로고침 하도록 설정!
    const interval = setInterval(fetchEvents, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🌟 3. 이벤트를 장애(Incident) 티켓으로 전환하는 마법의 함수!
  const handleCreateIncident = (ev) => {
    if (!window.confirm(`해당 이벤트를 장애(Incident)로 접수하시겠습니까?\n메시지: ${ev.message}`)) return;

    // 백엔드 인시던트 API가 요구하는 형식에 맞춰 자동 접수 데이터를 만듭니다.
    const incidentPayload = {
      title: `[자동접수] ${ev.severity} 이벤트 - ${ev.source}`,
      description: `이벤트 관제 시스템에서 자동 전환된 장애입니다.\n- 메시지: ${ev.message}\n- 발생 노드: ${ev.node}\n- 발생 일시: ${ev.timestamp}`,
      urgency: ev.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      status: 'OPEN',
      category: 'INFRA'
    };

    apiFetch('/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentPayload)
    })
    .then(res => {
      if (res.ok) {
        alert('🚨 장애 티켓이 성공적으로 생성되었습니다!');
        // 💡 백엔드에 이벤트를 '처리됨(PROCESSED)'으로 바꾸는 API가 있다면 여기서 호출합니다.
        // apiFetch(`/webhook/events/${ev.id}/status?status=PROCESSED`, { method: 'PATCH' });
        fetchEvents(); // 목록 새로고침
      } else {
        alert('장애 접수에 실패했습니다.');
      }
    })
    .catch(err => console.error('장애 전환 에러:', err));
  };

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const currentEvents = events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'CRITICAL': return { bg: '#fee2e2', text: '#ef4444', icon: '🚨' };
      case 'WARNING': return { bg: '#fef3c7', text: '#d97706', icon: '⚠️' };
      case 'INFO': return { bg: '#e0f2fe', text: '#0284c7', icon: 'ℹ️' };
      default: return { bg: '#f1f5f9', text: '#64748b', icon: '📌' };
    }
  };

  return (
    <div>
      <div className="action-bar" style={{ padding: '1rem', marginBottom: '1rem', backgroundColor: '#1e293b', color: 'white', borderRadius: '8px' }}>
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📡 통합 이벤트 관제 콘솔 (Event Monitoring)
        </h3>
        <button className="btn btn-outline" style={{ color: 'white', borderColor: 'white' }} onClick={fetchEvents}>
          🔄 즉시 새로고침
        </button>
      </div>
      
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>심각도</th>
              <th>발생 출처</th>
              <th>메시지</th>
              <th>노드 (IP/Host)</th>
              <th>처리 상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {currentEvents.map(ev => {
              const style = getSeverityStyle(ev.severity);
              return (
                <tr key={ev.id} style={{ backgroundColor: ev.severity === 'CRITICAL' && ev.status === 'NEW' ? '#fff1f2' : 'transparent' }}>
                  <td>{ev.id}</td>
                  <td>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', backgroundColor: style.bg, color: style.text }}>
                      {style.icon} {ev.severity}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>{ev.source}</td>
                  <td style={{ fontWeight: 'bold', color: ev.severity === 'CRITICAL' ? '#e11d48' : 'var(--text-main)' }}>{ev.message}</td>
                  <td>{ev.node || '-'}</td>
                  <td>
                    <span style={{ color: ev.status === 'PROCESSED' ? '#10b981' : (ev.status === 'NEW' ? '#ef4444' : '#64748b'), fontWeight: 'bold' }}>
                      {ev.status === 'PROCESSED' ? '✅ 처리됨' : '🔥 미처리'}
                    </span>
                  </td>
                  <td>
                    {/* 🌟 미처리 상태인 경우에만 장애 전환 버튼 표시 */}
                    {ev.status === 'NEW' ? (
                      <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.85rem' }} onClick={() => handleCreateIncident(ev)}>
                        장애 전환 🚀
                      </button>
                    ) : (
                      ev.relatedIncidentId ? (
                        <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>INC-{ev.relatedIncidentId}</span>
                      ) : '-'
                    )}
                  </td>
                </tr>
              );
            })}
            {events.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>수신된 이벤트가 없습니다. 시스템이 평화롭습니다!</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button className="page-btn" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>이전</button>
          <span style={{ margin: '0 1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{currentPage} / {totalPages}</span>
          <button className="page-btn" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>다음</button>
        </div>
      )}
    </div>
  );
};

export default EventConsole;