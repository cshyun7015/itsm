import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';

// 🌟 토큰을 자동으로 담아주는 apiFetch 임포트!
import { apiFetch } from '../../utils/api';

const IncidentRegistrationModal = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    companyId: 1, 
    title: '', 
    description: '', 
    requesterName: '', 
    priority: 'MEDIUM',
    ciId: '',     
    ciName: ''    
  });

  const [ciList, setCiList] = useState([]);

  // 모달이 열릴 때 CMDB(자산) 목록을 불러옵니다.
  useEffect(() => {
    // 🌟 기본 fetch 대신 apiFetch 사용
    apiFetch('/cmdb')
      .then(res => res.json())
      .then(data => setCiList(data))
      .catch(err => console.error('CMDB 목록 로드 실패:', err));
  }, []);

  // 🌟 일반 텍스트 필드 변경 핸들러
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 🌟 자산(CI) Select 박스 변경 핸들러
  const handleCiChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData({ ...formData, ciId: '', ciName: '' });
      return;
    }
    const selectedCi = ciList.find(ci => ci.id.toString() === selectedId.toString());
    setFormData({ 
      ...formData, 
      ciId: selectedCi ? selectedCi.id : '', 
      ciName: selectedCi ? selectedCi.ciName : '' 
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.requesterName) {
      alert('필수 항목(요청자명, 제목, 설명)을 모두 입력해주세요.');
      return;
    }

    // 🌟 기본 fetch 대신 apiFetch 사용 (토큰 자동 포함)
    apiFetch('/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).then(res => {
      if (res.ok) {
        alert('장애(Incident)가 성공적으로 접수되었습니다.');
        onRefresh();
        onClose();
      } else {
        alert('장애 접수에 실패했습니다.');
      }
    }).catch(err => console.error('접수 에러:', err));
  };

  return (
    // 🌟 투박한 div 백그라운드 대신 MUI Dialog 사용
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 'bold' }}>🚨 신규 장애(Incident) 접수</DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          
          <TextField 
            label="요청자명" name="requesterName" 
            value={formData.requesterName} onChange={handleChange} 
            fullWidth required placeholder="예: 홍길동"
          />

          <FormControl fullWidth>
            <InputLabel>관련 자산 (CI)</InputLabel>
            <Select 
              name="ciId" value={formData.ciId} 
              onChange={handleCiChange} label="관련 자산 (CI)"
            >
              <MenuItem value=""><em>-- 선택 안함 --</em></MenuItem>
              {ciList.map(ci => (
                <MenuItem key={ci.id} value={ci.id}>
                  {ci.ciName} ({ci.environment})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField 
            label="장애 제목" name="title" 
            value={formData.title} onChange={handleChange} 
            fullWidth required 
          />

          <TextField 
            label="상세 설명" name="description" 
            value={formData.description} onChange={handleChange} 
            fullWidth required multiline rows={4} 
            placeholder="장애 증상, 발생 시간, 오류 메시지 등을 상세히 적어주세요."
          />

          <FormControl fullWidth>
            <InputLabel>우선순위 (Priority)</InputLabel>
            <Select 
              name="priority" value={formData.priority} 
              onChange={handleChange} label="우선순위 (Priority)"
            >
              <MenuItem value="LOW">LOW (낮음)</MenuItem>
              <MenuItem value="MEDIUM">MEDIUM (보통)</MenuItem>
              <MenuItem value="HIGH">HIGH (높음)</MenuItem>
              <MenuItem value="CRITICAL">CRITICAL (긴급)</MenuItem>
            </Select>
          </FormControl>

        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">취소</Button>
        {/* 장애 접수는 눈에 띄게 빨간색(error) 버튼으로 강조합니다 */}
        <Button onClick={handleSubmit} variant="contained" color="error">
          장애 접수
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IncidentRegistrationModal;