import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, TablePagination, TableSortLabel, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { apiFetch } from '../../utils/api';

function ServiceRequestTable({ onRowClick }) {
  const [requests, setRequests] = useState([]);
  const [catalogs, setCatalogs] = useState([]); // 수동 등록 시 카탈로그 선택을 위함
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 
  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('desc'); 

  // 수동 생성/수정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ id: null, catalogId: '', title: '', description: '', targetDate: '', requesterName: '', approvalStatus: 'PENDING' });

  const userRole = localStorage.getItem('userRole'); 
  const canApprove = userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN';

  const fetchRequests = () => {
    apiFetch(`/service-requests?page=${page}&size=${rowsPerPage}&sort=${orderBy}&direction=${order}`)
      .then(res => res.json())
      .then(data => { setRequests(data.content); setTotalElements(data.totalElements); })
      .catch(err => console.error(err));
  };

  const fetchCatalogs = () => {
    apiFetch('/catalogs?all=true').then(res => res.json()).then(data => setCatalogs(data));
  };

  useEffect(() => { 
    fetchRequests(); 
    if (canApprove) fetchCatalogs(); // 담당자인 경우에만 카탈로그 목록 로드
  }, [page, rowsPerPage, orderBy, order]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); setOrderBy(property); setPage(0);
  };

  const getApprovalStyle = (status) => {
    switch (status) {
      case 'APPROVED': return { bgcolor: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
      case 'REJECTED': return { bgcolor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
      case 'PENDING': return { bgcolor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' };
      default: return { bgcolor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    }
  };

  // 기존 퀵 결재(승인/반려) 기능
  const handleApprove = async (e, id, status) => {
    e.stopPropagation();
    if (!window.confirm(`이 요청을 ${status === 'APPROVED' ? '승인' : '반려'}하시겠습니까?`)) return;
    try {
      const res = await apiFetch(`/service-requests/${id}/approval?status=${status}`, { method: 'PUT' });
      if (res.ok) fetchRequests();
    } catch (error) { console.error(error); }
  };

  // 모달 핸들러
  const handleOpenCreate = () => {
    setFormData({ id: null, catalogId: catalogs[0]?.id || '', title: '', description: '', targetDate: new Date().toISOString().split('T')[0], requesterName: '', approvalStatus: 'PENDING' });
    setModalMode('CREATE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, req) => {
    e.stopPropagation();
    setFormData({ 
      id: req.id, catalogId: req.catalog?.id || '', title: req.title, description: req.description, 
      targetDate: req.targetDeliveryDate || '', requesterName: req.requesterName, approvalStatus: req.approvalStatus 
    });
    setModalMode('EDIT');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // 수동 저장/수정 실행
  const handleSubmit = async () => {
    if (!formData.catalogId || !formData.title || !formData.targetDate) return alert('필수 항목을 입력하세요.');
    
    const url = modalMode === 'CREATE' ? '/service-requests' : `/service-requests/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

    try {
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { handleCloseModal(); fetchRequests(); }
      else alert('저장에 실패했습니다.');
    } catch (error) { console.error(error); }
  };

  // 수동 삭제 실행
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('정말 이 서비스 요청을 삭제하시겠습니까?')) return;
    try {
      const res = await apiFetch(`/service-requests/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRequests();
      else alert('삭제에 실패했습니다.');
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      {canApprove && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            수동 요청 등록
          </Button>
        </Box>
      )}

      <Paper sx={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>ID</TableSortLabel></TableCell>
                <TableCell fontWeight="bold">카탈로그 명</TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'title'} direction={orderBy === 'title' ? order : 'asc'} onClick={() => handleSort('title')}>제목</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'requesterName'} direction={orderBy === 'requesterName' ? order : 'asc'} onClick={() => handleSort('requesterName')}>요청자</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'targetDeliveryDate'} direction={orderBy === 'targetDeliveryDate' ? order : 'asc'} onClick={() => handleSort('targetDeliveryDate')}>목표일</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'approvalStatus'} direction={orderBy === 'approvalStatus' ? order : 'asc'} onClick={() => handleSort('approvalStatus')}>승인 상태</TableSortLabel></TableCell>
                {canApprove && <TableCell align="center" fontWeight="bold">관리</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>데이터가 없습니다.</TableCell></TableRow>
              ) : requests.map((req) => (
                <TableRow key={req.id} hover onClick={() => onRowClick && onRowClick(req)} sx={{ cursor: 'pointer' }}>
                  <TableCell>SR-{req.id}</TableCell>
                  <TableCell><Typography variant="body2" color="primary" fontWeight="bold">{req.catalog?.name}</Typography></TableCell>
                  <TableCell>{req.title}</TableCell>
                  <TableCell>{req.requesterName}</TableCell>
                  <TableCell>{req.targetDeliveryDate || '-'}</TableCell>
                  <TableCell><Chip label={req.approvalStatus} size="small" sx={{ fontWeight: 'bold', ...getApprovalStyle(req.approvalStatus) }} /></TableCell>
                  {canApprove && (
                    <TableCell align="center">
                      {/* 빠른 결재 버튼 */}
                      {req.approvalStatus === 'PENDING' ? (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', mb: 1 }}>
                          <Button size="small" variant="contained" color="success" onClick={(e) => handleApprove(e, req.id, 'APPROVED')}>승인</Button>
                          <Button size="small" variant="outlined" color="error" onClick={(e) => handleApprove(e, req.id, 'REJECTED')}>반려</Button>
                        </Box>
                      ) : <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>결재완료</Typography>}
                      
                      {/* 🌟 수동 수정/삭제 버튼 */}
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton size="small" color="primary" onClick={(e) => handleOpenEdit(e, req)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={(e) => handleDelete(e, req.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={totalElements} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} />
      </Paper>

      {/* 🌟 수동 등록 및 수정 모달 */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle fontWeight="bold">{modalMode === 'CREATE' ? '서비스 요청 수동 등록' : '서비스 요청 수정'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>카탈로그 (서비스 종류)</InputLabel>
              <Select name="catalogId" value={formData.catalogId} onChange={handleChange} label="카탈로그 (서비스 종류)">
                {catalogs.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="신청자명" name="requesterName" value={formData.requesterName} onChange={handleChange} fullWidth />
            <TextField label="요청 제목" name="title" value={formData.title} onChange={handleChange} fullWidth />
            <TextField label="상세 내용" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} />
            <TextField label="목표일" name="targetDate" type="date" value={formData.targetDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            
            {modalMode === 'EDIT' && (
              <FormControl fullWidth>
                <InputLabel>승인 상태</InputLabel>
                <Select name="approvalStatus" value={formData.approvalStatus} onChange={handleChange} label="승인 상태">
                  <MenuItem value="PENDING">PENDING (대기)</MenuItem>
                  <MenuItem value="APPROVED">APPROVED (승인됨)</MenuItem>
                  <MenuItem value="REJECTED">REJECTED (반려됨)</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">{modalMode === 'CREATE' ? '등록' : '수정'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ServiceRequestTable;