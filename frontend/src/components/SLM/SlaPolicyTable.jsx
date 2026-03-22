import React, { useState, useEffect } from 'react';
import { 
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, TablePagination, TableSortLabel, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { apiFetch } from '../../utils/api';

function SlaPolicyTable() {
  const [policies, setPolicies] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 
  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('desc'); 

  // 검색 상태
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ 
    id: null, policyName: '', targetType: 'INCIDENT', targetPriority: 'MEDIUM', 
    targetTime: 24, description: '', status: 'ACTIVE' 
  });

  const userRole = localStorage.getItem('userRole'); 
  const canEdit = userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN';

  const fetchPolicies = () => {
    const url = `/slm/policies?page=${page}&size=${rowsPerPage}&sort=${orderBy}&dir=${order}&name=${searchName}&type=${searchType}&status=${searchStatus}`;
    apiFetch(url).then(res => res.json())
      .then(data => { setPolicies(data.content || []); setTotalElements(data.totalElements || 0); })
      .catch(err => console.error('SLA 정책 로드 실패:', err));
  };

  useEffect(() => { fetchPolicies(); }, [page, rowsPerPage, orderBy, order, triggerSearch]); 

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); setOrderBy(property); setPage(0);
  };

  const handleOpenCreate = () => {
    setFormData({ id: null, policyName: '', targetType: 'INCIDENT', targetPriority: 'MEDIUM', targetTime: 24, description: '', status: 'ACTIVE' });
    setModalMode('CREATE'); setIsModalOpen(true);
  };

  const handleOpenEdit = (policy) => {
    setFormData({ ...policy });
    setModalMode('EDIT'); setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.policyName || !formData.targetTime) return alert('정책명과 목표 시간은 필수입니다.');
    const url = modalMode === 'CREATE' ? '/slm/policies' : `/slm/policies/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

    try {
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { setIsModalOpen(false); fetchPolicies(); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 정책을 삭제하시겠습니까?')) return;
    try {
      const res = await apiFetch(`/slm/policies/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPolicies();
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      {/* 🌟 다중 검색 바 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>적용 대상</InputLabel>
          <Select value={searchType} onChange={(e) => setSearchType(e.target.value)} label="적용 대상">
            <MenuItem value="">전체 대상</MenuItem>
            <MenuItem value="INCIDENT">장애 (INCIDENT)</MenuItem>
            <MenuItem value="SERVICE_REQUEST">서비스 요청 (SR)</MenuItem>
            <MenuItem value="PROBLEM">문제 (PROBLEM)</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>상태</InputLabel>
          <Select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} label="상태">
            <MenuItem value="">전체 상태</MenuItem>
            <MenuItem value="ACTIVE">활성</MenuItem>
            <MenuItem value="INACTIVE">비활성</MenuItem>
          </Select>
        </FormControl>
        <TextField size="small" label="정책명 검색" value={searchName} onChange={(e) => setSearchName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} sx={{ flexGrow: 1 }} />
        <Button variant="outlined" onClick={() => setTriggerSearch(prev => prev + 1)}>검색</Button>
        {canEdit && <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>신규 정책</Button>}
      </Box>

      {/* 🌟 데이터 테이블 */}
      <Paper sx={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>ID</TableSortLabel></TableCell>
                <TableCell fontWeight="bold">적용 대상</TableCell>
                <TableCell fontWeight="bold">정책명</TableCell>
                <TableCell fontWeight="bold">조건(우선순위)</TableCell>
                <TableCell fontWeight="bold">목표 시간(H)</TableCell>
                <TableCell fontWeight="bold">상태</TableCell>
                {canEdit && <TableCell align="center" fontWeight="bold">관리</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {policies.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.id}</TableCell>
                  <TableCell><Chip label={p.targetType} size="small" sx={{ bgcolor: p.targetType === 'INCIDENT' ? '#fee2e2' : '#dbeafe', color: p.targetType === 'INCIDENT' ? '#ef4444' : '#3b82f6', fontWeight: 'bold' }}/></TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{p.policyName}</TableCell>
                  <TableCell>{p.targetPriority}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>⏳ {p.targetTime} 시간</TableCell>
                  <TableCell><Chip label={p.status} size="small" color={p.status === 'ACTIVE' ? 'success' : 'default'} /></TableCell>
                  {canEdit && (
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEdit(p)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={totalElements} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} />
      </Paper>

      {/* 🌟 등록/수정 모달 */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>{modalMode === 'CREATE' ? '신규 SLA 정책 등록' : 'SLA 정책 수정'}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <TextField label="정책명" name="policyName" value={formData.policyName} onChange={(e) => setFormData({...formData, policyName: e.target.value})} fullWidth required />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>적용 대상</InputLabel>
              <Select value={formData.targetType} onChange={(e) => setFormData({...formData, targetType: e.target.value})} label="적용 대상">
                <MenuItem value="INCIDENT">장애 (INCIDENT)</MenuItem>
                <MenuItem value="SERVICE_REQUEST">서비스 요청 (SR)</MenuItem>
                <MenuItem value="PROBLEM">문제 (PROBLEM)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>적용 우선순위 조건</InputLabel>
              <Select value={formData.targetPriority} onChange={(e) => setFormData({...formData, targetPriority: e.target.value})} label="적용 우선순위 조건">
                <MenuItem value="CRITICAL">CRITICAL</MenuItem>
                <MenuItem value="HIGH">HIGH</MenuItem>
                <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                <MenuItem value="LOW">LOW</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="목표 해결 시간 (시간 단위)" type="number" value={formData.targetTime} onChange={(e) => setFormData({...formData, targetTime: e.target.value})} fullWidth required />
            <FormControl fullWidth>
              <InputLabel>활성 상태</InputLabel>
              <Select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} label="활성 상태">
                <MenuItem value="ACTIVE">활성 (ACTIVE)</MenuItem>
                <MenuItem value="INACTIVE">비활성 (INACTIVE)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TextField label="상세 설명" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} fullWidth multiline rows={2} />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsModalOpen(false)}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">저장</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SlaPolicyTable;