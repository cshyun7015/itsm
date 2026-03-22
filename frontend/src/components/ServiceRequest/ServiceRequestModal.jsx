import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, Typography 
} from '@mui/material';
import { apiFetch } from '../../utils/api';

function ServiceRequestModal({ open, onClose, catalogItem }) {
  const [formData, setFormData] = useState({ 
    catalogId: '', 
    title: '', 
    description: '', 
    targetDate: '', 
    requesterName: '' 
  });

  // 🌟 전달받은 catalogItem이 있으면 해당 데이터를 바탕으로 초기값을 세팅합니다.
  useEffect(() => {
    if (catalogItem && open) {
      const target = new Date();
      target.setDate(target.getDate() + (catalogItem.estimatedDays || 1));
      
      setFormData({
        catalogId: catalogItem.id, 
        title: `[신청] ${catalogItem.name}`, 
        description: catalogItem.description || '', 
        targetDate: target.toISOString().split('T')[0], 
        requesterName: localStorage.getItem('userName') || ''
      });
    }
  }, [catalogItem, open]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.targetDate) {
      return alert('필수 항목을 모두 입력해주세요.');
    }

    try {
      const res = await apiFetch('/service-requests', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData) 
      });
      
      if (res.ok) { 
        alert('서비스 요청이 성공적으로 접수되었습니다!\n[서비스 요청 관리] 탭에서 확인하실 수 있습니다.'); 
        onClose(); 
      } else {
        alert('요청 접수에 실패했습니다.');
      }
    } catch (error) { 
      console.error(error); 
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>서비스 신청서 작성</DialogTitle>
      
      <DialogContent dividers>
        {/* 🌟 catalogItem이 정상적으로 들어왔을 때만 렌더링되는 파란색 안내 박스 */}
        {catalogItem && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 1 }}>
            <Typography variant="subtitle2" color="primary" fontWeight="bold">
              선택된 서비스: {catalogItem.name}
            </Typography>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <TextField 
            label="신청자명" name="requesterName" 
            value={formData.requesterName} onChange={handleChange} fullWidth 
          />
          <TextField 
            label="요청 제목" name="title" 
            value={formData.title} onChange={handleChange} fullWidth 
          />
          <TextField 
            label="상세 사유 및 내용" name="description" 
            value={formData.description} onChange={handleChange} 
            fullWidth multiline rows={4} 
            helperText="기본 제공된 서비스 내용을 바탕으로 필요한 상세 정보를 수정/추가해 주세요."
          />
          <TextField 
            label="희망 완료일" name="targetDate" type="date" 
            value={formData.targetDate} onChange={handleChange} 
            fullWidth InputLabelProps={{ shrink: true }} 
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">취소</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          신청 제출
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ServiceRequestModal;