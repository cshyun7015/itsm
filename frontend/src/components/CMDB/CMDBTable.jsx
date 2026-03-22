import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, TablePagination, TableSortLabel, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import StorageIcon from '@mui/icons-material/Storage';
import { apiFetch } from '../../utils/api';

function CMDBTable() {
  const [cis, setCIs] = useState([]);
  
  // 페이징 & 정렬 상태
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 
  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('desc'); 

  // 🌟 다중 검색 상태 (분류, 자산명, 환경, 담당자)
  const [searchType, setSearchType] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchEnv, setSearchEnv] = useState('');
  const [searchOwner, setSearchOwner] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0); 

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ 
    id: null, ciName: '', ciType: 'SERVER', ipAddress: '', 
    environment: 'PROD', ownerName: '', description: '', 
    status: 'ACTIVE', lastAuditedAt: '' 
  });

  const userRole = localStorage.getItem('userRole'); 
  const canEdit = userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN';
  const canDelete = userRole === 'ROLE_ADMIN'; // 자산 삭제는 통상 관리자만 가능

  // 🌟 백엔드 API 호출 (서버 사이드 페이징 및 다중 검색 적용)
  const fetchCIs = () => {
    const url = `/cmdb?page=${page}&size=${rowsPerPage}&sort=${orderBy}&direction=${order}&ciType=${searchType}&ciName=${searchName}&environment=${searchEnv}&ownerName=${searchOwner}`;
    apiFetch(url)
      .then(res => res.json())
      .then(data => { 
        setCIs(data.content || []); 
        setTotalElements(data.totalElements || 0); 
      })
      .catch(err => console.error('자산 데이터 로드 실패:', err));
  };

  useEffect(() => { 
    fetchCIs(); 
  }, [page, rowsPerPage, orderBy, order, triggerSearch]); 

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); 
    setOrderBy(property); 
    setPage(0);
  };

  // 디자인 요소: 상태, 환경, 분류 뱃지
  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return { color: 'success', label: '사용 중 (ACTIVE)' };
      case 'IN_MAINTENANCE': return { color: 'warning', label: '점검 중 (MAINTENANCE)' };
      case 'RETIRED': return { color: 'default', label: '폐기됨 (RETIRED)' };
      default: return { color: 'default', label: status };
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'SERVER': return { bgcolor: '#eff6ff', color: '#2563eb' };
      case 'DATABASE': return { bgcolor: '#faf5ff', color: '#9333ea' };
      case 'NETWORK': return { bgcolor: '#f0fdfa', color: '#0d9488' };
      case 'SOFTWARE': return { bgcolor: '#fdf4ff', color: '#c026d3' };
      default: return { bgcolor: '#f8fafc', color: '#64748b' };
    }
  };

  const getEnvColor = (env) => {
    switch(env) {
      case 'PROD': return { border: '1px solid #ef4444', color: '#ef4444' };
      case 'STAGE': return { border: '1px solid #f59e0b', color: '#f59e0b' };
      case 'DEV': return { border: '1px solid #10b981', color: '#10b981' };
      default: return { border: '1px solid #cbd5e1', color: '#64748b' };
    }
  };

  const handleOpenCreate = () => {
    setFormData({ 
      id: null, ciName: '', ciType: 'SERVER', ipAddress: '', 
      environment: 'PROD', ownerName: '', description: '', 
      status: 'ACTIVE', lastAuditedAt: new Date().toISOString().split('T')[0] 
    });
    setModalMode('CREATE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, ci) => {
    e.stopPropagation();
    setFormData({ 
      ...ci, 
      lastAuditedAt: ci.lastAuditedAt ? ci.lastAuditedAt.split('T')[0] : '' 
    });
    setModalMode('EDIT');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // 저장 (CREATE / UPDATE)
  const handleSubmit = async () => {
    if (!formData.ciName || !formData.ownerName) return alert('자산명과 담당자는 필수 입력입니다.');

    const url = modalMode === 'CREATE' ? '/cmdb' : `/cmdb/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

    try {
      const res = await apiFetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData) 
      });
      if (res.ok) { 
        handleCloseModal(); 
        fetchCIs(); 
      } else alert('저장에 실패했습니다.');
    } catch (error) { console.error(error); }
  };

  // 삭제
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('정말 이 자산(CI)을 삭제하시겠습니까? (관리자 전용)')) return;
    try {
      const res = await apiFetch(`/cmdb/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCIs();
      else alert('삭제에 실패했습니다. 권한을 확인하세요.');
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      {/* 상단 액션 바 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <StorageIcon color="primary" /> 구성 항목 (CI) 목록
        </Typography>
        
        {canEdit && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            신규 자산 등록
          </Button>
        )}
      </Box>

      {/* 🌟 다중 조건 검색 바 */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>분류 (Type)</InputLabel>
          <Select value={searchType} onChange={(e) => setSearchType(e.target.value)} label="분류 (Type)">
            <MenuItem value=""><em>전체</em></MenuItem>
            <MenuItem value="SERVER">서버 (SERVER)</MenuItem>
            <MenuItem value="DATABASE">데이터베이스 (DB)</MenuItem>
            <MenuItem value="NETWORK">네트워크 (NETWORK)</MenuItem>
            <MenuItem value="SOFTWARE">소프트웨어 (SW)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>환경</InputLabel>
          <Select value={searchEnv} onChange={(e) => setSearchEnv(e.target.value)} label="환경">
            <MenuItem value=""><em>전체 환경</em></MenuItem>
            <MenuItem value="PROD">운영 (PROD)</MenuItem>
            <MenuItem value="STAGE">스테이징 (STAGE)</MenuItem>
            <MenuItem value="DEV">개발 (DEV)</MenuItem>
          </Select>
        </FormControl>
        
        <TextField size="small" label="담당자명" value={searchOwner} onChange={(e) => setSearchOwner(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} sx={{ width: 150 }} />
        <TextField size="small" label="자산명(CI) 검색" value={searchName} onChange={(e) => setSearchName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} sx={{ flexGrow: 1, minWidth: 200 }} />
        <Button variant="outlined" onClick={() => setTriggerSearch(prev => prev + 1)}>검색</Button>
      </Paper>

      {/* 🌟 데이터 테이블 */}
      <Paper sx={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 850 }}>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>ID</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'ciType'} direction={orderBy === 'ciType' ? order : 'asc'} onClick={() => handleSort('ciType')}>분류</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'environment'} direction={orderBy === 'environment' ? order : 'asc'} onClick={() => handleSort('environment')}>환경</TableSortLabel></TableCell>
                <TableCell fontWeight="bold" sx={{ width: '25%' }}><TableSortLabel active={orderBy === 'ciName'} direction={orderBy === 'ciName' ? order : 'asc'} onClick={() => handleSort('ciName')}>자산명 (CI Name)</TableSortLabel></TableCell>
                <TableCell fontWeight="bold">IP 주소</TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'ownerName'} direction={orderBy === 'ownerName' ? order : 'asc'} onClick={() => handleSort('ownerName')}>담당자</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleSort('status')}>상태</TableSortLabel></TableCell>
                {canEdit && <TableCell align="center" fontWeight="bold">관리</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {cis.length === 0 ? (
                <TableRow><TableCell colSpan={canEdit ? 8 : 7} align="center" sx={{ py: 5 }}>등록된 구성 항목(CI)이 없습니다.</TableCell></TableRow>
              ) : cis.map((ci) => {
                const statusInfo = getStatusColor(ci.status);
                const typeStyle = getTypeColor(ci.ciType);
                const envStyle = getEnvColor(ci.environment);
                return (
                  <TableRow key={ci.id} hover>
                    <TableCell>{ci.id}</TableCell>
                    <TableCell>
                      <Chip label={ci.ciType} size="small" sx={{ fontWeight: 'bold', ...typeStyle }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={ci.environment} size="small" variant="outlined" sx={{ fontWeight: 'bold', ...envStyle }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{ci.ciName}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{ci.ipAddress || '-'}</TableCell>
                    <TableCell>{ci.ownerName}</TableCell>
                    <TableCell>
                      <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ fontWeight: 'bold' }} />
                    </TableCell>
                    
                    {canEdit && (
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={(e) => handleOpenEdit(e, ci)}><EditIcon fontSize="small" /></IconButton>
                        {canDelete && <IconButton size="small" color="error" onClick={(e) => handleDelete(e, ci.id)}><DeleteIcon fontSize="small" /></IconButton>}
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
          {modalMode === 'CREATE' ? '신규 IT 자산(CI) 등록' : 'IT 자산(CI) 정보 업데이트'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="자산명 (CI Name)" name="ciName" value={formData.ciName} onChange={handleChange} fullWidth required placeholder="예: Web-Server-01" />
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>자산 분류 (Type)</InputLabel>
                <Select name="ciType" value={formData.ciType} onChange={handleChange} label="자산 분류 (Type)">
                  <MenuItem value="SERVER">서버 (SERVER)</MenuItem>
                  <MenuItem value="DATABASE">데이터베이스 (DB)</MenuItem>
                  <MenuItem value="NETWORK">네트워크 (NETWORK)</MenuItem>
                  <MenuItem value="SOFTWARE">소프트웨어 (SW)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="IP 주소" name="ipAddress" value={formData.ipAddress} onChange={handleChange} fullWidth placeholder="예: 192.168.1.10" />
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>운영 환경</InputLabel>
                <Select name="environment" value={formData.environment} onChange={handleChange} label="운영 환경">
                  <MenuItem value="PROD">운영 (PROD)</MenuItem>
                  <MenuItem value="STAGE">스테이징 (STAGE)</MenuItem>
                  <MenuItem value="DEV">개발 (DEV)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="담당자 (Owner)" name="ownerName" value={formData.ownerName} onChange={handleChange} fullWidth required />
              <TextField label="최근 점검일" name="lastAuditedAt" type="date" value={formData.lastAuditedAt} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Box>

            {modalMode === 'EDIT' && (
              <FormControl fullWidth>
                <InputLabel>자산 상태</InputLabel>
                <Select name="status" value={formData.status} onChange={handleChange} label="자산 상태">
                  <MenuItem value="ACTIVE">사용 중 (ACTIVE)</MenuItem>
                  <MenuItem value="IN_MAINTENANCE">점검/유지보수 중 (IN_MAINTENANCE)</MenuItem>
                  <MenuItem value="RETIRED">폐기됨 (RETIRED)</MenuItem>
                </Select>
              </FormControl>
            )}

            <TextField label="상세 설명 / 스펙" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} placeholder="OS, CPU, Memory 등 주요 제원 및 설명을 입력하세요." />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {modalMode === 'CREATE' ? '자산 등록' : '정보 업데이트'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CMDBTable;