import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Grid, Card, CardContent, CardActions, 
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, MenuItem, Select, FormControl, InputLabel, Paper 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import ApprovalIcon from '@mui/icons-material/Approval';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupIcon from '@mui/icons-material/Group';
import SearchIcon from '@mui/icons-material/Search';

import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import ExtensionIcon from '@mui/icons-material/Extension';
import BuildIcon from '@mui/icons-material/Build';

import { apiFetch } from '../../utils/api';
// ServiceRequestModal 컴포넌트의 실제 경로에 맞게 조정해주세요.
import ServiceRequestModal from '../ServiceRequest/ServiceRequestModal';

function ServiceCatalogTable() {
  const [catalogs, setCatalogs] = useState([]);
  
  // 🌟 [추가] 공통 코드 상태 관리
  const [categories, setCategories] = useState([]);
  const [audienceGroups, setAudienceGroups] = useState([]);

  // 검색 및 조회 상태
  const [searchCategory, setSearchCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState(''); 
  const [triggerSearch, setTriggerSearch] = useState(0);

  // 관리자 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ 
    id: null, name: '', description: '', category: '', estimatedDays: 1, isActive: true,
    approvalRequired: false, cost: 0, targetAudience: '', iconCode: 'SW'
  });

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCatalogForApply, setSelectedCatalogForApply] = useState(null);

  const userRole = localStorage.getItem('userRole'); 
  const canEdit = userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN';

  // 🌟 [추가] 컴포넌트 마운트 시 공통 코드 API 호출
  useEffect(() => {
    // 1. 카테고리 목록 가져오기
    apiFetch('/dropdown/common-codes/CATALOG_CATEGORY')
      .then(res => res.json())
      .then(data => {
        setCategories(data || []);
        if (data.length > 0) setFormData(prev => ({ ...prev, category: data[0].codeValue }));
      })
      .catch(err => console.error('카테고리 로드 실패:', err));

    // 2. 신청 대상자 목록 가져오기
    apiFetch('/dropdown/common-codes/AUDIENCE_GROUP')
      .then(res => res.json())
      .then(data => {
        setAudienceGroups(data || []);
        if (data.length > 0) setFormData(prev => ({ ...prev, targetAudience: data[0].codeValue }));
      })
      .catch(err => console.error('대상자 그룹 로드 실패:', err));
  }, []);

  const fetchCatalogs = () => {
    const baseUrl = canEdit ? '/catalogs' : '/catalogs/active';
    const queryParams = new URLSearchParams({
      size: 100,
      category: searchCategory,
      name: searchKeyword,
    });

    apiFetch(`${baseUrl}?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => setCatalogs(data.content || data || []))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchCatalogs(); }, [triggerSearch]); 

  const handleOpenCreate = () => { 
    setFormData({ 
      id: null, name: '', description: '', 
      category: categories.length > 0 ? categories[0].codeValue : 'SW', 
      estimatedDays: 1, isActive: true, approvalRequired: false, cost: 0, 
      targetAudience: audienceGroups.length > 0 ? audienceGroups[0].codeValue : 'ALL', 
      iconCode: 'SW' 
    }); 
    setModalMode('CREATE'); setIsModalOpen(true); 
  };
  const handleOpenEdit = (catalog) => { setFormData({ ...catalog }); setModalMode('EDIT'); setIsModalOpen(true); };
  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if(!formData.name) return alert('서비스명은 필수입니다.');
    const url = modalMode === 'CREATE' ? '/catalogs' : `/catalogs/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';
    try {
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { handleCloseModal(); fetchCatalogs(); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 서비스를 카탈로그에서 삭제하시겠습니까?')) return;
    try {
      const res = await apiFetch(`/catalogs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCatalogs();
    } catch (error) { console.error(error); }
  };

  const handleApplyService = (catalog) => { 
    setSelectedCatalogForApply(catalog); 
    setIsApplyModalOpen(true); 
  };

  // UI 헬퍼 함수
  const getDynamicIcon = (iconCode) => {
    const iconStyle = { fontSize: '2.2rem' };
    switch(iconCode) {
      case 'HW': return <LaptopMacIcon sx={{ ...iconStyle, color: '#60a5fa' }} />;
      case 'ACCESS': return <VpnKeyIcon sx={{ ...iconStyle, color: '#f472b6' }} />;
      case 'INFRA': return <CloudQueueIcon sx={{ ...iconStyle, color: '#22d3ee' }} />;
      case 'SW': return <ExtensionIcon sx={{ ...iconStyle, color: '#4ade80' }} />;
      default: return <BuildIcon sx={{ ...iconStyle, color: '#94a3b8' }} />;
    }
  };

  // 🌟 [추가] DB에 저장된 영문 코드를 화면 표시용 한글명으로 변환
  const getCategoryName = (codeValue) => {
    const found = categories.find(c => c.codeValue === codeValue);
    return found ? found.codeName : codeValue;
  };

  const getAudienceName = (codeValue) => {
    const found = audienceGroups.find(c => c.codeValue === codeValue);
    return found ? found.codeName : codeValue;
  };

  return (
    <Box sx={{ p: 3, bgcolor: '#0f172a', minHeight: '100vh', borderRadius: '12px', color: '#f8fafc' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.5px' }}>
          🛒 Nexus Service Catalog
        </Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate} sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, fontWeight: 'bold' }}>
            신규 서비스 등록
          </Button>
        )}
      </Box>

      {/* 검색 바 */}
      <Paper sx={{ p: 2, mb: 4, display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#1e293b', border: '1px solid #334155', boxShadow: 'none', borderRadius: '12px' }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel sx={{ color: '#94a3b8' }}>카테고리</InputLabel>
          <Select 
            value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)} label="카테고리"
            sx={{ color: '#f8fafc', '.MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }}
          >
            <MenuItem value=""><em>전체 카테고리</em></MenuItem>
            {/* 🌟 동적 카테고리 렌더링 */}
            {categories.map(c => (
              <MenuItem key={c.codeValue} value={c.codeValue}>{c.codeName}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField 
          size="small" placeholder="서비스 명칭 또는 설명 검색" value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)}
          sx={{ flexGrow: 1, bgcolor: '#0f172a', borderRadius: '8px', input: { color: '#f8fafc' }, '.MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }}
          InputProps={{ startAdornment: <SearchIcon sx={{ color: '#64748b', mr: 1 }} /> }}
        />
        
        <Button variant="outlined" onClick={() => setTriggerSearch(prev => prev + 1)} sx={{ fontWeight: 'bold', color: '#60a5fa', borderColor: '#60a5fa', '&:hover': { borderColor: '#93c5fd', bgcolor: 'rgba(96, 165, 250, 0.1)' } }}>
          검색
        </Button>
      </Paper>

      {/* 서비스 카드 그리드 */}
      <Grid container spacing={3}>
        {catalogs.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', opacity: item.isActive ? 1 : 0.5, bgcolor: '#1e293b', borderRadius: '16px', border: '1px solid #334155', transition: 'transform 0.2s', '&:hover': { transform: item.isActive ? 'translateY(-5px)' : 'none' } }}>
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                  <Box sx={{ p: 1.8, bgcolor: '#0f172a', borderRadius: '14px', border: '1px solid #334155' }}>
                    {getDynamicIcon(item.iconCode || item.category)}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, alignItems: 'flex-end' }}>
                    {/* 🌟 동적 카테고리 명칭 렌더링 */}
                    <Chip label={getCategoryName(item.category)} size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', fontWeight: 'bold', border: '1px solid rgba(96, 165, 250, 0.3)' }} />
                    {!item.isActive && <Chip label="비활성" size="small" color="error" variant="outlined" sx={{fontSize: '0.7rem'}} />}
                  </Box>
                </Box>

                <Typography variant="h6" fontWeight="bold" mb={1} sx={{ color: '#f8fafc', lineHeight: 1.3 }}>{item.name}</Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', minHeight: '40px', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, pt: 2, borderTop: '1px dashed #475569' }}>
                  <Chip icon={<ApprovalIcon sx={{ fontSize: '1rem', color: item.approvalRequired ? '#fbbf24' : '#34d399' }} />} label={item.approvalRequired ? "결재 필요" : "자동 승인"} size="small" sx={{ bgcolor: 'transparent', color: item.approvalRequired ? '#fbbf24' : '#34d399', border: '1px solid' }} />
                  {item.cost > 0 && (
                    <Chip icon={<AttachMoneyIcon sx={{ fontSize: '1rem', color: '#cbd5e1' }} />} label={`₩${item.cost.toLocaleString()}`} size="small" sx={{ bgcolor: 'transparent', color: '#cbd5e1', border: '1px solid #475569' }} />
                  )}
                  {/* 🌟 동적 대상자 그룹 명칭 렌더링 */}
                  <Chip icon={<GroupIcon sx={{ fontSize: '1rem', color: '#cbd5e1' }} />} label={getAudienceName(item.targetAudience)} size="small" sx={{ bgcolor: 'transparent', color: '#cbd5e1', border: '1px solid #475569' }} />
                  <Typography variant="caption" fontWeight="bold" sx={{ color: '#64748b', width: '100%', mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    ⏳ 예상 소요: <span style={{color: '#f8fafc'}}>{item.estimatedDays}일</span>
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 0, bgcolor: 'transparent' }}>
                <Button variant="contained" size="medium" startIcon={<ShoppingCartCheckoutIcon />} disabled={!item.isActive} onClick={() => handleApplyService(item)} sx={{ borderRadius: '10px', fontWeight: 'bold', px: 3, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, '&.Mui-disabled': { bgcolor: '#334155', color: '#64748b' } }}>
                  서비스 신청
                </Button>
                {canEdit && (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" sx={{ color: '#60a5fa', bgcolor: 'rgba(96, 165, 250, 0.1)' }} onClick={() => handleOpenEdit(item)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" sx={{ color: '#f87171', bgcolor: 'rgba(248, 113, 113, 0.1)' }} onClick={() => handleDelete(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 등록/수정 모달 */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: '#1e293b', color: '#f8fafc', borderRadius: '16px', border: '1px solid #334155', backgroundImage: 'none' } }}>
        <DialogTitle fontWeight="bold" sx={{ borderBottom: '1px solid #334155', p: 3 }}>
          {modalMode === 'CREATE' ? '🚀 신규 카탈로그 등록' : '📝 카탈로그 정보 수정'}
        </DialogTitle>
        <DialogContent sx={{ p: 3, pt: '20px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField label="서비스명" name="name" value={formData.name} onChange={handleChange} fullWidth required InputLabelProps={{ sx: { color: '#94a3b8' } }} inputProps={{ sx: { color: '#f8fafc' } }} sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }} />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }}>
                <InputLabel sx={{ color: '#94a3b8' }}>카테고리</InputLabel>
                <Select name="category" value={formData.category} onChange={handleChange} label="카테고리" sx={{ color: '#f8fafc' }}>
                  {/* 🌟 동적 카테고리 셀렉트 */}
                  {categories.map(c => (
                    <MenuItem key={c.codeValue} value={c.codeValue}>{c.codeName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }}>
                <InputLabel sx={{ color: '#94a3b8' }}>UI 아이콘</InputLabel>
                <Select name="iconCode" value={formData.iconCode} onChange={handleChange} label="UI 아이콘" sx={{ color: '#f8fafc' }}>
                  <MenuItem value="SW">퍼즐 (SW)</MenuItem>
                  <MenuItem value="HW">노트북 (HW)</MenuItem>
                  <MenuItem value="ACCESS">열쇠 (권한)</MenuItem>
                  <MenuItem value="INFRA">구름 (인프라)</MenuItem>
                  <MenuItem value="GENERAL">도구 (기타)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField label="상세 설명" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} InputLabelProps={{ sx: { color: '#94a3b8' } }} inputProps={{ sx: { color: '#f8fafc' } }} sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }} />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }}>
                <InputLabel sx={{ color: '#94a3b8' }}>결재 필요 여부</InputLabel>
                <Select name="approvalRequired" value={formData.approvalRequired} onChange={handleChange} label="결재 필요 여부" sx={{ color: '#f8fafc' }}>
                  <MenuItem value={true}>부서장 승인 필요</MenuItem>
                  <MenuItem value={false}>자동 승인 (결재 불필요)</MenuItem>
                </Select>
              </FormControl>
              <TextField label="과금 비용 (원)" name="cost" type="number" value={formData.cost} onChange={handleChange} fullWidth helperText="무료인 경우 0" InputLabelProps={{ sx: { color: '#94a3b8' } }} inputProps={{ sx: { color: '#f8fafc' } }} FormHelperTextProps={{ sx: { color: '#64748b' } }} sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }}>
                <InputLabel sx={{ color: '#94a3b8' }}>신청 대상자</InputLabel>
                <Select name="targetAudience" value={formData.targetAudience} onChange={handleChange} label="신청 대상자" sx={{ color: '#f8fafc' }}>
                  {/* 🌟 동적 신청 대상자 그룹 셀렉트 */}
                  {audienceGroups.map(a => (
                    <MenuItem key={a.codeValue} value={a.codeValue}>{a.codeName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="예상 소요 일수" name="estimatedDays" type="number" value={formData.estimatedDays} onChange={handleChange} fullWidth InputLabelProps={{ sx: { color: '#94a3b8' } }} inputProps={{ sx: { color: '#f8fafc' } }} sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }} />
            </Box>

            <FormControl fullWidth sx={{ '.MuiOutlinedInput-notchedOutline': { borderColor: '#475569' } }}>
              <InputLabel sx={{ color: '#94a3b8' }}>노출 상태</InputLabel>
              <Select name="isActive" value={formData.isActive} onChange={handleChange} label="노출 상태" sx={{ color: '#f8fafc' }}>
                <MenuItem value={true}>활성 (쇼핑몰에 표시)</MenuItem>
                <MenuItem value={false}>비활성 (숨김)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #334155' }}>
          <Button onClick={handleCloseModal} sx={{ color: '#cbd5e1' }}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, fontWeight: 'bold', px: 3 }}>
            {modalMode === 'CREATE' ? '카탈로그 등록' : '정보 수정'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🌟 신청 모달 컴포넌트 */}
      <ServiceRequestModal 
        open={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        catalogItem={selectedCatalogForApply} 
      />
    </Box>
  );
}

export default ServiceCatalogTable;