import React, { useState } from 'react';

const ServiceRequestModal = ({ catalogItem, onClose }) => {
  const [formData, setFormData] = useState({
    title: `[신청] ${catalogItem.name}`,
    description: '',
    requesterName: '',
    targetDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/service-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, catalogId: catalogItem.id }),
    }).then(res => {
      if (res.ok) {
        alert('서비스 요청이 성공적으로 접수되었습니다.');
        onClose();
      }
    });
  };

  return (
    <div style={modalBackdropStyle}>
      <div style={modalContentStyle}>
        <h3 style={{ marginTop: 0 }}>서비스 신청: {catalogItem.name}</h3>
        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label htmlFor="sr-requester" style={labelStyle}>신청자 성함</label>
            <input 
              id="sr-requester"
              name="requesterName"
              type="text" 
              placeholder="이름을 입력하세요" 
              onChange={e => setFormData({...formData, requesterName: e.target.value})} 
              required 
              style={inputStyle} 
            />
          </div>
          <div>
            <label htmlFor="sr-title" style={labelStyle}>요청 제목</label>
            <input 
              id="sr-title"
              name="title"
              type="text" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
              style={inputStyle} 
            />
          </div>
          <div>
            <label htmlFor="sr-desc" style={labelStyle}>신청 상세 사유</label>
            <textarea 
              id="sr-desc"
              name="description"
              placeholder="신청 사유를 구체적으로 적어주세요" 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              required 
              rows="4" 
              style={inputStyle} 
            />
          </div>
          <div>
            <label htmlFor="sr-date" style={labelStyle}>희망 완료일</label>
            <input 
              id="sr-date"
              name="targetDate"
              type="date" 
              value={formData.targetDate} 
              onChange={e => setFormData({...formData, targetDate: e.target.value})} 
              style={inputStyle} 
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" style={{ ...btnStyle, backgroundColor: '#0056b3' }}>신청 확정</button>
            <button type="button" onClick={onClose} style={{ ...btnStyle, backgroundColor: '#adb5bd' }}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const modalBackdropStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 };
const modalContentStyle = { backgroundColor: 'white', padding: '35px', borderRadius: '15px', width: '480px' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' };
const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: '700', color: '#333' };
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #dee2e6', width: '100%', boxSizing: 'border-box' };
const btnStyle = { flex: 1, padding: '14px', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default ServiceRequestModal;