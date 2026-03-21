import React, { useState, useEffect } from 'react';

const IncidentRegistrationModal = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    companyId: 1, 
    title: '', 
    description: '', 
    requesterName: '', 
    priority: 'MEDIUM',
    ciId: '',     // 🌟 선택된 자산 ID
    ciName: ''    // 🌟 선택된 자산명
  });

  const [ciList, setCiList] = useState([]); // 🌟 자산 목록 상태

  // 모달이 열릴 때 CMDB(자산) 목록을 불러옵니다.
  useEffect(() => {
    fetch('http://localhost:8080/api/cmdb')
      .then(res => res.json())
      .then(data => setCiList(data))
      .catch(err => console.error('CMDB 목록 로드 실패:', err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then(res => {
      if (res.ok) {
        alert('장애(Incident)가 성공적으로 접수되었습니다.');
        onRefresh();
        onClose();
      }
    });
  };

  const handleCiChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData({ ...formData, ciId: null, ciName: null });
      return;
    }
    const selectedCi = ciList.find(ci => ci.id.toString() === selectedId);
    setFormData({ ...formData, ciId: selectedCi.id, ciName: selectedCi.ciName });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>신규 장애(Incident) 접수</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div>
            <label className="form-label">요청자 성함</label>
            <input type="text" className="form-control" style={inputStyle} onChange={(e) => setFormData({...formData, requesterName: e.target.value})} required />
          </div>

          {/* 🌟 장애 발생 자산 선택 (CMDB 연동) */}
          <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
            <label className="form-label" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>💻 장애 발생 자산 (Affected CI)</label>
            <select className="form-control" style={inputStyle} onChange={handleCiChange}>
              <option value="">-- 관련 자산이 없거나 모름 --</option>
              {ciList.map(ci => (
                <option key={ci.id} value={ci.id}>
                  [{ci.ciType}] {ci.ciName} ({ci.environment})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">제목</label>
            <input type="text" className="form-control" style={inputStyle} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>

          <div>
            <label className="form-label">상세 설명</label>
            <textarea className="form-control" rows="4" style={inputStyle} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
          </div>

          <div>
            <label className="form-label">우선순위</label>
            <select className="form-control" style={inputStyle} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
              <option value="LOW">낮음</option>
              <option value="MEDIUM">보통</option>
              <option value="HIGH">높음</option>
              <option value="CRITICAL">긴급</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn btn-success" style={{ flex: 1 }}>등록</button>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputStyle = { width: '100%', boxSizing: 'border-box' };

export default IncidentRegistrationModal;