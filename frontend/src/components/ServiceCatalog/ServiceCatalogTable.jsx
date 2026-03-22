import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Grid, Card, CardContent, CardActions, 
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import { apiFetch } from '../../utils/api';

// 🌟 신청 모달 컴포넌트 임포트 (경로를 본인 환경에 맞게 확인해주세요)
import ServiceRequestModal from '../ServiceRequest/ServiceRequestModal';

function ServiceCatalogTable() {
  const [catalogs, setCatalogs] = useState([]);
  
  // 관리자 카탈로그 등록/수정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ id: null, name: '', description: '', category: 'S/W', estimatedDays: 1, isActive: true });

  // 🌟 사용자 신청 모달 상태 및 선택된 데이터 저장소
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCatalogForApply, setSelectedCatalogForApply] = useState(null);

  const userRole = localStorage.getItem('userRole'); 
  const canEdit = userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN';

  const fetchCatalogs = () => {
    apiFetch(canEdit ? '/catalogs?all=true' : '/catalogs')
      .then(res => res.json())
      .then(data => setCatalogs(data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchCatalogs(); }, []);

  const handleOpenCreate = () => { setFormData({ id: null, name: '', description: '', category: 'S/W', estimatedDays: 1, isActive: true }); setModalMode('CREATE'); setIsModalOpen(true); };
  const handleOpenEdit = (catalog) => { setFormData({ ...catalog }); setModalMode('EDIT'); setIsModalOpen(true); };
  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    const url = modalMode === 'CREATE' ? '/catalogs' : `/catalogs/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';
    try {
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { handleCloseModal(); fetchCatalogs(); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      const res = await apiFetch(`/catalogs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCatalogs();
    } catch (error) { console.error(error); }
  };

  // 🌟 [핵심] 신청 버튼을 누르면 클릭한 아이템(catalog) 전체를 상태에 저장하고 모달을 엽니다.
  const handleApplyService = (catalog) => { 
    setSelectedCatalogForApply(catalog); 
    setIsApplyModalOpen(true); 
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">🛒 서비스 카탈로그</Typography>
        {canEdit && <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>신규 등록</Button>}
      </Box>

      <Grid container spacing={3}>
        {catalogs.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: item.isActive ? 1 : 0.6, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Chip label={item.category} size="small" sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 'bold' }} />
                  {!item.isActive && <Chip label="비활성" size="small" color="error" variant="outlined" />}
                </Box>
                <Typography variant="h6" fontWeight="bold" mb={1}>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary" minHeight="40px">{item.description}</Typography>
                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'block', mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
                  ⏳ 예상 소요: {item.estimatedDays}일
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                {/* 🌟 [핵심] onClick에서 객체(item)를 넘겨줍니다! */}
                <Button variant="contained" size="small" startIcon={<ShoppingCartCheckoutIcon />} disabled={!item.isActive} onClick={() => handleApplyService(item)} sx={{ borderRadius: '20px' }}>신청하기</Button>
                {canEdit && (
                  <Box>
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(item)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 관리자용 등록/수정 모달 */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold">{modalMode === 'CREATE' ? '신규 등록' : '수정'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="서비스명" name="name" value={formData.name} onChange={handleChange} fullWidth required />
            <FormControl fullWidth>
              <InputLabel>카테고리</InputLabel>
              <Select name="category" value={formData.category} onChange={handleChange} label="카테고리">
                <MenuItem value="S/W">소프트웨어</MenuItem>
                <MenuItem value="H/W">하드웨어</MenuItem>
                <MenuItem value="접근권한">접근권한</MenuItem>
              </Select>
            </FormControl>
            <TextField label="상세 설명" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} />
            <TextField label="예상 소요 일수" name="estimatedDays" type="number" value={formData.estimatedDays} onChange={handleChange} fullWidth />
            <FormControl fullWidth>
              <InputLabel>상태</InputLabel>
              <Select name="isActive" value={formData.isActive} onChange={handleChange} label="상태">
                <MenuItem value={true}>활성</MenuItem>
                <MenuItem value={false}>비활성</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">{modalMode === 'CREATE' ? '등록' : '수정'}</Button>
        </DialogActions>
      </Dialog>

      {/* 🌟 [핵심] 서비스 신청 모달 팝업 렌더링 (catalogItem 프롭스를 확실하게 전달!) */}
      <ServiceRequestModal 
        open={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        catalogItem={selectedCatalogForApply} 
      />
    </Box>
  );
}

export default ServiceCatalogTable;