import React, { useState } from 'react';
import { apiFetch } from '../../utils/api';

const ChangeDetailModal = ({ request, onClose, onRefresh }) => {
  const [comment, setComment] = useState('');

  // 상태 업데이트 API 호출 (PATCH)
  const handleStatusUpdate = (newStatus) => {
    // 🌟 쌩 fetch 대신 apiFetch 사용 (주소도 짧게!)
    apiFetch(`/changes/${request.id}/status?status=${newStatus}`, {
      method: 'PATCH', // 또는 백엔드 구현에 따라 PUT
    }).then(res => {
      if (res.ok) {
        alert(`변경 요청 상태가 [${newStatus}] 로 업데이트되었습니다.`);
        onRefresh();
        onClose();
      } else {
        alert('상태 업데이트에 실패했습니다.');
      }
    }).catch(err => console.error('API Error:', err));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: 'var(--text-main)' }}>변경 요청 상세 (CR-{request.id})</h3>
          <span style={{ 
            padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
            backgroundColor: request.status === 'CAB_APPROVAL' ? '#fef3c7' : request.status === 'SCHEDULED' ? '#dbeafe' : '#f1f5f9',
            color: request.status === 'CAB_APPROVAL' ? '#d97706' : request.status === 'SCHEDULED' ? '#2563eb' : 'var(--text-main)'
          }}>
            현재 상태: {request.status}
          </span>
        </div>

        {/* --- 기본 정보 섹션 --- */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)' }}>
          <div><strong style={labelStyle}>요청자:</strong> {request.requesterName}</div>
          <div><strong style={labelStyle}>변경 예정일:</strong> {request.scheduledAt || '미정'}</div>
          <div style={{ gridColumn: '1 / -1' }}><strong style={labelStyle}>위험도:</strong> 
            <span style={{ marginLeft: '10px', color: request.riskLevel === 'HIGH' ? '#ef4444' : 'var(--text-main)', fontWeight: 'bold' }}>{request.riskLevel}</span>
          </div>
          <div style={{ gridColumn: '1 / -1' }}><strong style={labelStyle}>제목:</strong> {request.title}</div>
        </div>

        {/* --- 상세 계획 섹션 --- */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <h4 style={h4Style}>1. 변경 사유 및 목적</h4>
            <div style={boxStyle}>{request.reason}</div>
          </div>
          <div>
            <h4 style={h4Style}>2. 실행 계획 (Action Plan)</h4>
            <div style={boxStyle}>{request.plan}</div>
          </div>
          <div>
            <h4 style={h4Style}>3. 원복 계획 (Backout Plan)</h4>
            <div style={boxStyle}>{request.backoutPlan}</div>
          </div>
        </div>

        {/* --- CAB 승인 / 액션 영역 --- */}
        <div style={{ borderTop: '2px solid var(--border-light)', paddingTop: '1.5rem' }}>
          
          {/* 심의 대기 상태일 때: 승인/반려 버튼 노출 */}
          {request.status === 'CAB_APPROVAL' && (
            <>
              <label style={{ ...labelStyle, display: 'block', marginBottom: '0.5rem' }}>검토 의견 (반려 시 필수)</label>
              <textarea 
                className="form-control" 
                rows="2" 
                style={{ width: '100%', boxSizing: 'border-box', marginBottom: '1rem' }} 
                placeholder="승인 또는 반려 사유를 입력하세요..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-success" style={{ flex: 1 }} onClick={() => handleStatusUpdate('SCHEDULED')}>CAB 승인 (일정 확정)</button>
                <button className="btn btn-primary" style={{ flex: 1, backgroundColor: '#ef4444' }} onClick={() => handleStatusUpdate('REJECTED')}>반려 (Reject)</button>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>닫기</button>
              </div>
            </>
          )}

          {/* 일정이 확정된 상태일 때: 작업 완료 버튼 노출 */}
          {request.status === 'SCHEDULED' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => handleStatusUpdate('COMPLETED')}>✅ 변경 작업 완료 처리</button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>닫기</button>
            </div>
          )}

          {/* 그 외 상태 (COMPLETED, REJECTED 등) */}
          {['COMPLETED', 'REJECTED'].includes(request.status) && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={onClose}>닫기</button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// 내부 스타일
const labelStyle = { color: 'var(--text-muted)', fontSize: '0.9rem' };
const h4Style = { margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1rem' };
const boxStyle = { padding: '1rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' };

export default ChangeDetailModal;