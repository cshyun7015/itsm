import React, { useState, useEffect } from 'react';

const IncidentDetailModal = ({ ticket, onClose, onRefresh }) => {
  const [updateStatus, setUpdateStatus] = useState(ticket.status);
  const [updateComment, setUpdateComment] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/incidents/${ticket.id}/history`)
      .then(res => res.json())
      .then(data => setHistory(data));
  }, [ticket.id]);

  const handleUpdate = (e) => {
    e.preventDefault();
    const url = `http://localhost:8080/api/incidents/${ticket.id}/status?status=${updateStatus}&comment=${encodeURIComponent(updateComment)}&updaterId=EMP-9999`;
    fetch(url, { method: 'PUT' }).then(res => {
      if (res.ok) {
        alert('변경되었습니다.');
        onRefresh();
        onClose();
      }
    });
  };

  return (
    <div style={modalBackdropStyle}>
      <div style={{ ...modalContentStyle, width: '600px', maxHeight: '85vh', overflowY: 'auto' }}>
        <h3>티켓 상세 - #{ticket.id}</h3>
        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', marginBottom: '20px' }}>
          <p><strong>제목:</strong> {ticket.title}</p>
          <p><strong>설명:</strong> {ticket.description}</p>
        </div>
        
        <form onSubmit={handleUpdate} style={formStyle}>
          <select value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)} style={inputStyle}>
            <option value="OPEN">OPEN</option><option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option><option value="CLOSED">CLOSED</option>
          </select>
          <textarea value={updateComment} onChange={(e) => setUpdateComment(e.target.value)} placeholder="처리 내용 기록..." rows="2" style={inputStyle} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ ...btnStyle, backgroundColor: '#28a745' }}>업데이트</button>
            <button type="button" onClick={onClose} style={{ ...btnStyle, backgroundColor: '#ccc' }}>닫기</button>
          </div>
        </form>

        <div style={{ marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <h4>변경 이력 (Audit Trail)</h4>
          {history.map((h, i) => (
            <div key={i} style={historyItemStyle}>
              <div style={{ fontSize: '0.75rem', color: '#666' }}>{new Date(h.createdAt).toLocaleString()} | {h.changedBy}</div>
              <strong>{h.previousStatus} ➔ {h.newStatus}</strong>
              {h.updateComment && <div style={{ marginTop: '4px' }}>- {h.updateComment}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 스타일 (RegistrationModal과 공유하거나 별도 CSS 파일 권장)
const modalBackdropStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '8px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '10px' };
const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' };
const btnStyle = { flex: 1, padding: '10px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const historyItemStyle = { fontSize: '0.85rem', padding: '8px', borderLeft: '3px solid #0056b3', marginBottom: '10px', backgroundColor: '#fdfdfd' };

export default IncidentDetailModal;