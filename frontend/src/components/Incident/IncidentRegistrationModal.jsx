import React, { useState } from 'react';

const IncidentRegistrationModal = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    companyId: 1, 
    title: '', 
    description: '', 
    requesterName: '', 
    priority: 'MEDIUM'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then(res => {
      if (res.ok) {
        alert('인시던트가 성공적으로 등록되었습니다.');
        onRefresh();
        onClose();
      }
    });
  };

  return (
    <div style={modalBackdropStyle}>
      <div style={modalContentStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>신규 인시던트 접수</h3>
        <form onSubmit={handleSubmit} style={formStyle}>
          
          <div>
            <label htmlFor="requester-name" style={labelStyle}>요청자 성함</label>
            <input 
              id="requester-name"
              name="requesterName"
              type="text" 
              placeholder="예: 홍길동"
              onChange={(e) => setFormData({...formData, requesterName: e.target.value})} 
              required 
              style={inputStyle} 
            />
          </div>

          <div>
            <label htmlFor="incident-title" style={labelStyle}>제목</label>
            <input 
              id="incident-title"
              name="title"
              type="text" 
              placeholder="장애 내용을 간략히 입력하세요"
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
              style={inputStyle} 
            />
          </div>

          <div>
            <label htmlFor="incident-desc" style={labelStyle}>상세 설명</label>
            <textarea 
              id="incident-desc"
              name="description"
              placeholder="발생 경위 및 에러 메시지 등을 입력하세요"
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              required 
              rows="5" 
              style={inputStyle} 
            />
          </div>

          <div>
            <label htmlFor="incident-priority" style={labelStyle}>우선순위</label>
            <select 
              id="incident-priority"
              name="priority"
              onChange={(e) => setFormData({...formData, priority: e.target.value})} 
              style={inputStyle}
            >
              <option value="LOW">낮음</option>
              <option value="MEDIUM">보통</option>
              <option value="HIGH">높음</option>
              <option value="CRITICAL">긴급</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ ...btnStyle, backgroundColor: '#28a745' }}>등록</button>
            <button type="button" onClick={onClose} style={{ ...btnStyle, backgroundColor: '#adb5bd' }}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const modalBackdropStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalContentStyle = { backgroundColor: 'white', padding: '40px', borderRadius: '15px', width: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '600', color: '#495057' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6', width: '100%', boxSizing: 'border-box', fontSize: '1rem' };
const btnStyle = { flex: 1, padding: '14px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' };

export default IncidentRegistrationModal;