import React, { useState } from 'react';

const ServiceRequestDetailModal = ({ request, onClose, onRefresh }) => {
  const [comment, setComment] = useState('');

  const handleApproval = (status) => {
    const url = `http://localhost:8080/api/service-requests/${request.id}/approval?status=${status}&comment=${encodeURIComponent(comment)}`;
    
    fetch(url, { method: 'PUT' })
      .then(res => {
        if (res.ok) {
          alert(`요청이 ${status === 'APPROVED' ? '승인' : '반려'}되었습니다.`);
          onRefresh();
          onClose();
        }
      });
  };

  return (
    <div style={modalBackdropStyle}>
      <div style={modalContentStyle}>
        <h3>서비스 요청 상세 (# {request.id})</h3>
        <div style={detailBoxStyle}>
          <p><strong>서비스명:</strong> {request.catalog?.name}</p>
          <p><strong>요청자:</strong> {request.requesterName}</p>
          <p><strong>제목:</strong> {request.title}</p>
          <p><strong>상세 내용:</strong><br/>{request.description}</p>
          <p><strong>희망 완료일:</strong> {request.targetDeliveryDate}</p>
        </div>

        {/* 승인 대기 중(PENDING)일 때만 버튼 노출 */}
        {request.approvalStatus === 'PENDING' ? (
          <div style={{ marginTop: '20px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>검토 의견</label>
            <textarea 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              placeholder="반려 시 사유를 반드시 입력해주세요."
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={() => handleApproval('APPROVED')} style={{ ...btnStyle, backgroundColor: '#27ae60' }}>승인 (Approve)</button>
              <button onClick={() => handleApproval('REJECTED')} style={{ ...btnStyle, backgroundColor: '#e74c3c' }}>반려 (Reject)</button>
              <button onClick={onClose} style={{ ...btnStyle, backgroundColor: '#ccc' }}>닫기</button>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <p style={{ color: '#666' }}>이미 처리가 완료된 요청입니다. ({request.approvalStatus})</p>
            <button onClick={onClose} style={{ ...btnStyle, backgroundColor: '#ccc', flex: 'none', width: '100px' }}>닫기</button>
          </div>
        )}
      </div>
    </div>
  );
};

const modalBackdropStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 };
const modalContentStyle = { backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '500px' };
const detailBoxStyle = { backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '4px', fontSize: '0.9rem', lineHeight: '1.6' };
const inputStyle = { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnStyle = { flex: 1, padding: '10px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };

export default ServiceRequestDetailModal;