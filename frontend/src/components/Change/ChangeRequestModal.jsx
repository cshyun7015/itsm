import React, { useState } from 'react';

const ChangeRequestModal = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    requesterName: '',
    title: '',
    reason: '',
    riskLevel: 'MEDIUM',
    plan: '',
    backoutPlan: '',
    scheduledAt: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 날짜 포맷 맞추기 (백엔드가 LocalDateTime을 받을 수 있도록 'T00:00:00' 추가)
    const payload = { ...formData };
    if (payload.scheduledAt) {
      payload.scheduledAt = `${payload.scheduledAt}T00:00:00`;
    }

    fetch('http://localhost:8080/api/changes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(res => {
      if (res.ok) {
        alert('변경 요청(CR)이 성공적으로 등록되어 심의(CAB) 대기 중입니다.');
        onRefresh();
        onClose();
      } else {
        alert('등록 중 오류가 발생했습니다.');
      }
    }).catch(err => console.error(err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay">
      {/* 변경 요청은 입력할 내용이 많아 모달 너비를 600px로 조금 더 넓게 잡습니다 */}
      <div className="modal-content" style={{ width: '600px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)' }}>신규 시스템 변경 요청서 (CR)</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="cr-requester" style={labelStyle}>요청자 성함</label>
              <input id="cr-requester" name="requesterName" type="text" className="form-control" style={{ width: '100%', boxSizing: 'border-box' }} onChange={handleChange} required />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="cr-date" style={labelStyle}>변경 예정일</label>
              <input id="cr-date" name="scheduledAt" type="date" className="form-control" style={{ width: '100%', boxSizing: 'border-box' }} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label htmlFor="cr-title" style={labelStyle}>변경 제목</label>
            <input id="cr-title" name="title" type="text" className="form-control" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="예: DB 서버 정기 보안 패치" onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="cr-risk" style={labelStyle}>위험도 (Risk Level)</label>
            <select id="cr-risk" name="riskLevel" className="form-control" style={{ width: '100%', boxSizing: 'border-box' }} value={formData.riskLevel} onChange={handleChange}>
              <option value="LOW">낮음 (단순 구성 변경)</option>
              <option value="MEDIUM">보통 (일부 서비스 재시작 필요)</option>
              <option value="HIGH">높음 (전체 서비스 중단 동반)</option>
            </select>
          </div>

          <div>
            <label htmlFor="cr-reason" style={labelStyle}>변경 사유 및 목적</label>
            <textarea id="cr-reason" name="reason" className="form-control" rows="2" style={{ width: '100%', boxSizing: 'border-box' }} onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="cr-plan" style={labelStyle}>실행 계획 (Action Plan)</label>
            <textarea id="cr-plan" name="plan" className="form-control" rows="3" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="작업 순서와 절차를 상세히 기술하세요" onChange={handleChange} required />
          </div>

          <div>
            <label htmlFor="cr-backout" style={labelStyle}>원복 계획 (Backout Plan)</label>
            <textarea id="cr-backout" name="backoutPlan" className="form-control" rows="2" style={{ width: '100%', boxSizing: 'border-box' }} placeholder="작업 실패 시 이전 상태로 되돌리는 절차" onChange={handleChange} required />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>제출 (CAB 심의 요청)</button>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' };

export default ChangeRequestModal;