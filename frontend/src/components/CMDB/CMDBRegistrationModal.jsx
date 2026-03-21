import React, { useState } from 'react';

const CMDBRegistrationModal = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    ciName: '',
    ciType: 'SERVER',
    ipAddress: '',
    environment: 'PROD',
    ownerName: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/cmdb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then(res => {
      if (res.ok) {
        alert('신규 IT 자산(CI)이 성공적으로 등록되었습니다.');
        onRefresh();
        onClose();
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '550px' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)' }}>신규 IT 자산(CI) 등록</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>자산명 (CI Name)</label>
              <input name="ciName" type="text" className="form-control" style={inputStyle} placeholder="예: Web-Server-01" onChange={handleChange} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>자산 분류 (Type)</label>
              <select name="ciType" className="form-control" style={inputStyle} onChange={handleChange}>
                <option value="SERVER">서버 (Server)</option>
                <option value="DATABASE">데이터베이스 (DB)</option>
                <option value="NETWORK">네트워크 장비 (Network)</option>
                <option value="SOFTWARE">소프트웨어 (SW)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>IP 주소</label>
              <input name="ipAddress" type="text" className="form-control" style={inputStyle} placeholder="예: 192.168.1.10" onChange={handleChange} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>운영 환경</label>
              <select name="environment" className="form-control" style={inputStyle} onChange={handleChange}>
                <option value="PROD">운영 (PROD)</option>
                <option value="STAGE">스테이징 (STAGE)</option>
                <option value="DEV">개발 (DEV)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>담당자 (Owner)</label>
            <input name="ownerName" type="text" className="form-control" style={inputStyle} placeholder="예: 시스템관리팀 홍길동" onChange={handleChange} required />
          </div>

          <div>
            <label style={labelStyle}>상세 설명 / 스펙</label>
            <textarea name="description" className="form-control" rows="3" style={inputStyle} placeholder="OS, CPU, Memory 등 자산의 주요 정보를 입력하세요" onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>자산 등록</button>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>취소</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' };
const inputStyle = { width: '100%', boxSizing: 'border-box' };

export default CMDBRegistrationModal;