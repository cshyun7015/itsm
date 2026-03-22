import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, TablePagination, TableSortLabel, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { apiFetch } from '../../utils/api';

function ReleaseTable() {
  const [releases, setReleases] = useState([]);
  
  // 페이징 & 정렬 상태
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 
  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('desc'); 

  // 🌟 다중 검색 상태 (유형, 제목, 담당자, 상태)
  const [searchType, setSearchType] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [searchManager, setSearchManager] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0); 

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ 
    id: null, version: '', title: '', description: '', 
    status: 'PLANNING', releaseType: 'MINOR', managerName: '', 
    targetDate: '', actualDate: '' 
  });

  const userRole = localStorage.getItem('userRole'); 
  const canEdit = userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN';
  const canDelete = userRole === 'ROLE_ADMIN'; // 배포 삭제는 통상 관리자만 가능

  // 🌟 백엔드 API 호출 (서버 사이드 페이징 및 다중 검색 적용)
  const fetchReleases = () => {
    const url = `/releases?page=${page}&size=${rowsPerPage}&sort=${orderBy}&direction=${order}&releaseType=${searchType}&title=${searchTitle}&managerName=${searchManager}&status=${searchStatus}`;
    apiFetch(url)
      .then(res => res.json())
      .then(data => { 
        setReleases(data.content || []); 
        setTotalElements(data.totalElements || 0); 
      })
      .catch(err => console.error('배포 데이터 로드 실패:', err));
  };

  useEffect(() => { 
    fetchReleases(); 
  }, [page, rowsPerPage, orderBy, order, triggerSearch]); 

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); 
    setOrderBy(property); 
    setPage(0);
  };

  // 상태별 뱃지 스타일
  const getStatusColor = (status) => {
    switch(status) {
      case 'PLANNING': return { color: 'default', label: '계획 중' };
      case 'BUILDING': return { color: 'info', label: '빌드 중 ⚙️' };
      case 'TESTING': return { color: 'warning', label: '테스트 중 🧪' };
      case 'DEPLOYING': return { color: 'primary', label: '배포 진행 중 🚀' };
      case 'COMPLETED': return { color: 'success', label: '배포 완료 ✅' };
      case 'FAILED': return { color: 'error', label: '롤백/실패 🚨' };
      default: return { color: 'default', label: status };
    }
  };

  // 배포 유형별 스타일
  const getTypeColor = (type) => {
    switch(type) {
      case 'MAJOR': return { bgcolor: '#fee2e2', color: '#ef4444' };
      case 'MINOR': return { bgcolor: '#eff6ff', color: '#3b82f6' };
      case 'EMERGENCY': return { bgcolor: '#ef4444', color: '#ffffff' };
      default: return { bgcolor: '#f1f5f9', color: '#64748b' };
    }
  };

  const handleOpenCreate = () => {
    setFormData({ 
      id: null, version: '', title: '', description: '', 
      status: 'PLANNING', releaseType: 'MINOR', 
      managerName: localStorage.getItem('userName') || '', 
      targetDate: '', actualDate: '' 
    });
    setModalMode('CREATE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, rel) => {
    e.stopPropagation();
    setFormData({ 
      id: rel.id, version: rel.version, title: rel.title, description: rel.description || '', 
      status: rel.status, releaseType: rel.releaseType || 'MINOR', managerName: rel.managerName || '', 
      targetDate: rel.targetDate ? rel.targetDate.split('T')[0] : '', 
      actualDate: rel.actualDate ? rel.actualDate.split('T')[0] : '' 
    });
    setModalMode('EDIT');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // 저장 (CREATE / UPDATE)
  const handleSubmit = async () => {
    if (!formData.title || !formData.version || !formData.targetDate) return alert('필수 항목(제목, 버전, 예정일)을 입력하세요.');

    const url = modalMode === 'CREATE' ? '/releases' : `/releases/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

    try {
      const res = await apiFetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData) 
      });
      if (res.ok) { 
        handleCloseModal(); 
        fetchReleases(); 
      } else alert('저장에 실패했습니다.');
    } catch (error) { console.error(error); }
  };

  // 삭제
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('정말 이 배포(Release) 기록을 삭제하시겠습니까? (관리자 전용)')) return;
    try {
      const res = await apiFetch(`/releases/${id}`, { method: 'DELETE' });
      if (res.ok) fetchReleases();
      else alert('삭제에 실패했습니다. 권한을 확인하세요.');
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      {/* 상단 액션 바 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <RocketLaunchIcon color="primary" /> 배포 관리 (Release Management)
        </Typography>
        
        {canEdit && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            신규 배포 계획 등록
          </Button>
        )}
      </Box>

      {/* 🌟 다중 조건 검색 바 */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>배포 유형</InputLabel>
          <Select value={searchType} onChange={(e) => setSearchType(e.target.value)} label="배포 유형">
            <MenuItem value=""><em>전체</em></MenuItem>
            <MenuItem value="MAJOR">MAJOR</MenuItem>
            <MenuItem value="MINOR">MINOR</MenuItem>
            <MenuItem value="EMERGENCY">EMERGENCY</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>진행 상태</InputLabel>
          <Select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} label="진행 상태">
            <MenuItem value=""><em>전체 상태</em></MenuItem>
            <MenuItem value="PLANNING">계획 중</MenuItem>
            <MenuItem value="BUILDING">빌드 중 ⚙️</MenuItem>
            <MenuItem value="TESTING">테스트 중 🧪</MenuItem>
            <MenuItem value="DEPLOYING">배포 진행 중 🚀</MenuItem>
            <MenuItem value="COMPLETED">배포 완료 ✅</MenuItem>
            <MenuItem value="FAILED">롤백/실패 🚨</MenuItem>
          </Select>
        </FormControl>
        
        <TextField size="small" label="담당자명" value={searchManager} onChange={(e) => setSearchManager(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} sx={{ width: 150 }} />
        <TextField size="small" label="배포 명칭 검색" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} sx={{ flexGrow: 1, minWidth: 200 }} />
        <Button variant="outlined" onClick={() => setTriggerSearch(prev => prev + 1)}>검색</Button>
      </Paper>

      {/* 🌟 데이터 테이블 */}
      <Paper sx={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 850 }}>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'version'} direction={orderBy === 'version' ? order : 'asc'} onClick={() => handleSort('version')}>버전</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'releaseType'} direction={orderBy === 'releaseType' ? order : 'asc'} onClick={() => handleSort('releaseType')}>유형</TableSortLabel></TableCell>
                <TableCell fontWeight="bold" sx={{ width: '25%' }}><TableSortLabel active={orderBy === 'title'} direction={orderBy === 'title' ? order : 'asc'} onClick={() => handleSort('title')}>배포 명칭</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleSort('status')}>상태</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'managerName'} direction={orderBy === 'managerName' ? order : 'asc'} onClick={() => handleSort('managerName')}>담당자</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'targetDate'} direction={orderBy === 'targetDate' ? order : 'asc'} onClick={() => handleSort('targetDate')}>예정일</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'actualDate'} direction={orderBy === 'actualDate' ? order : 'asc'} onClick={() => handleSort('actualDate')}>실제 완료일</TableSortLabel></TableCell>
                {canEdit && <TableCell align="center" fontWeight="bold">관리</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {releases.length === 0 ? (
                <TableRow><TableCell colSpan={canEdit ? 8 : 7} align="center" sx={{ py: 5 }}>등록된 배포(Release) 계획이 없습니다.</TableCell></TableRow>
              ) : releases.map((rel) => {
                const statusInfo = getStatusColor(rel.status);
                const typeStyle = getTypeColor(rel.releaseType);
                return (
                  <TableRow key={rel.id} hover>
                    <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1.05rem' }}>{rel.version}</TableCell>
                    <TableCell>
                      <Chip label={rel.releaseType} size="small" sx={{ fontWeight: 'bold', ...typeStyle }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{rel.title}</TableCell>
                    <TableCell>
                      <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell>{rel.managerName}</TableCell>
                    <TableCell>{rel.targetDate ? rel.targetDate.split('T')[0] : '미정'}</TableCell>
                    <TableCell sx={{ fontWeight: rel.actualDate ? 'bold' : 'normal', color: rel.status === 'FAILED' ? 'error.main' : 'inherit' }}>
                      {rel.actualDate ? rel.actualDate.split('T')[0] : '-'}
                    </TableCell>
                    
                    {canEdit && (
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={(e) => handleOpenEdit(e, rel)}><EditIcon fontSize="small" /></IconButton>
                        {canDelete && <IconButton size="small" color="error" onClick={(e) => handleDelete(e, rel.id)}><DeleteIcon fontSize="small" /></IconButton>}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination component="div" count={totalElements} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} />
      </Paper>

      {/* 🌟 등록 및 수정 모달 */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {modalMode === 'CREATE' ? '신규 배포(Release) 계획 등록' : '배포 정보 업데이트'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="배포 명칭" name="title" value={formData.title} onChange={handleChange} fullWidth required placeholder="예: v1.5 정기 서비스 배포" />
              <TextField label="버전 (Version)" name="version" value={formData.version} onChange={handleChange} sx={{ width: 200 }} required placeholder="예: v1.5.0" />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>배포 유형</InputLabel>
                <Select name="releaseType" value={formData.releaseType} onChange={handleChange} label="배포 유형">
                  <MenuItem value="MAJOR">MAJOR (대규모)</MenuItem>
                  <MenuItem value="MINOR">MINOR (기능 추가/수정)</MenuItem>
                  <MenuItem value="EMERGENCY">EMERGENCY (긴급 패치)</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>진행 상태</InputLabel>
                <Select name="status" value={formData.status} onChange={handleChange} label="진행 상태">
                  <MenuItem value="PLANNING">계획 중 (PLANNING)</MenuItem>
                  <MenuItem value="BUILDING">빌드 중 (BUILDING)</MenuItem>
                  <MenuItem value="TESTING">테스트 중 (TESTING)</MenuItem>
                  <MenuItem value="DEPLOYING">배포 진행 중 (DEPLOYING)</MenuItem>
                  <MenuItem value="COMPLETED">배포 완료 (COMPLETED)</MenuItem>
                  <MenuItem value="FAILED">롤백/실패 (FAILED)</MenuItem>
                </Select>
              </FormControl>

              <TextField label="담당자명" name="managerName" value={formData.managerName} onChange={handleChange} fullWidth />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="배포 예정일" name="targetDate" type="date" value={formData.targetDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
              <TextField label="실제 완료일" name="actualDate" type="date" value={formData.actualDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} helperText="배포가 완료(COMPLETED)되었을 때 입력하세요." />
            </Box>

            <TextField label="상세 내용 및 포함된 기능" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={4} placeholder="이번 릴리즈에 포함된 주요 변경 사항, 버그 수정 내역 등을 기록하세요." />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {modalMode === 'CREATE' ? '배포 계획 등록' : '업데이트 저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ReleaseTable;