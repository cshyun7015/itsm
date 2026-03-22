import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, Typography, FormControl, InputLabel, 
  Select, MenuItem, Chip, Divider, Paper 
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import BugReportIcon from '@mui/icons-material/BugReport';

// 🌟 apiFetch 임포트 추가
import { apiFetch } from '../../utils/api';

// 🌟 상태(Status)별 뱃지 색상 (테이블과 동일한 스타일 유지)
const getStatusColor = (status) => {
  switch (status) {
    case 'OPEN': return 'error';
    case 'IN_PROGRESS': return 'warning';
    case 'RESOLVED': return 'success';
    case 'CLOSED': return 'default';
    default: return 'primary';
  }
};

// 🌟 심각도(Priority)별 뱃지 색상
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'CRITICAL': return 'error';
    case 'HIGH': return 'warning';
    case 'MEDIUM': return 'info';
    case 'LOW': return 'success';
    default: return 'default';
  }
};

const IncidentDetailModal = ({ ticket, onClose, onRefresh }) => {
  const [updateStatus, setUpdateStatus] = useState(ticket.status);
  const [updatePriority, setUpdatePriority] = useState(ticket.priority); // 🌟 우선순위 업데이트 추가
  const [updateComment, setUpdateComment] = useState('');
  const [history, setHistory] = useState([]);

  // 변경 이력(Audit Trail) 로드
  useEffect(() => {
    // 🌟 apiFetch 적용
    apiFetch(`/incidents/${ticket.id}/history`)
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error('History load error:', err));
  }, [ticket.id]);

  // 티켓 상태 및 코멘트 업데이트
  const handleUpdate = (e) => {
    e.preventDefault();
    
    // 로컬 스토리지에서 현재 로그인한 사용자의 ID(이름)를 가져옵니다. 없으면 기본값 사용.
    const updaterId = localStorage.getItem('userName') || 'EMP-9999';

    // 🌟 apiFetch 적용
    // 🌟 상태, 우선순위, 코멘트만 전송! (제목/내용은 아예 보내지도 않음)
    const url = `/incidents/${ticket.id}/status?status=${updateStatus}&priority=${updatePriority}&comment=${encodeURIComponent(updateComment)}&updaterId=${updaterId}`;

    apiFetch(url, { method: 'PUT' }).then(res => {
      if (res.ok) {
        alert('업데이트 성공!');
        // 🌟 수정 직후 목록을 새로고침하기 위해 브라우저 새로고침이나 onRefresh 이벤트를 쏩니다
        // window.location.reload()를 쓰면 가장 확실하지만, SPA 방식인 onRefresh()를 권장합니다.
        // 🌟 수정된 부분: 강제 새로고침(window.location.reload) 제거!
        onRefresh(); // 1. 백엔드에서 최신 데이터를 다시 불러옵니다.
        onClose();   // 2. 모달창을 부드럽게 닫습니다.
      }
    });
  };

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 'bold' }}><BugReportIcon color="error" sx={{ verticalAlign: 'middle', mr: 1 }}/> INC-{ticket.id} 상세정보</DialogTitle>
      
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        
        {/* 1. 🌟 절대 수정할 수 없는 고정(Read-Only) 영역 */}
        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 2 }}>
          <Typography variant="caption" color="error" fontWeight="bold">※ 이 영역의 핵심 접수 내용은 위변조 방지를 위해 수정할 수 없습니다.</Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>{ticket.title}</Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            <strong>요청자:</strong> {ticket.requesterName} | <strong>접수일:</strong> {new Date(ticket.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', p: 1.5, bgcolor: '#ffffff', border: '1px dashed #94a3b8', borderRadius: 1 }}>
            {ticket.description}
          </Typography>
        </Paper>

        {/* 2. 관리자가 변경 가능한 부분 (부분 수정) */}
        <Box sx={{ border: '1px solid #e2e8f0', p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" color="primary" mb={2}>엔지니어 조치 내용 업데이트</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel>우선순위 수정</InputLabel>
              <Select value={updatePriority} label="우선순위 수정" onChange={(e) => setUpdatePriority(e.target.value)}>
                <MenuItem value="LOW">LOW</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
                <MenuItem value="CRITICAL">CRITICAL</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel>진행 상태</InputLabel>
              <Select value={updateStatus} label="진행 상태" onChange={(e) => setUpdateStatus(e.target.value)}>
                <MenuItem value="OPEN">OPEN (접수됨)</MenuItem>
                <MenuItem value="IN_PROGRESS">IN_PROGRESS (처리중)</MenuItem>
                <MenuItem value="RESOLVED">RESOLVED (해결됨)</MenuItem>
                <MenuItem value="CLOSED">CLOSED (종료)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="처리 코멘트" value={updateComment} onChange={(e) => setUpdateComment(e.target.value)}
              fullWidth multiline rows={2} placeholder="조치 내역 및 상태 변경 사유를 기록하세요."
            />
          </Box>
        </Box>

        {/* 3. 변경 이력 (Audit Trail) 영역 */}
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <HistoryIcon color="action" /> 변경 이력 (Audit Trail)
          </Typography>

          {history.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              아직 변경 이력이 없습니다.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {history.map((h, i) => (
                <Paper key={i} elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      🕒 {new Date(h.createdAt).toLocaleString()} | 작업자: <strong>{h.changedBy}</strong>
                    </Typography>
                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#1d4ed8', bgcolor: '#eff6ff', px: 1, py: 0.5, borderRadius: 1 }}>
                      {h.previousStatus} ➔ {h.newStatus}
                    </Typography>
                  </Box>
                  {h.updateComment && (
                    <Typography variant="body2" sx={{ mt: 1, color: '#475569', p: 1.5, bgcolor: '#f1f5f9', borderRadius: 1 }}>
                      💬 {h.updateComment}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </Box>

      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">닫기</Button>
        <Button onClick={handleUpdate} variant="contained" color="primary">업데이트 및 이력 저장</Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentDetailModal;