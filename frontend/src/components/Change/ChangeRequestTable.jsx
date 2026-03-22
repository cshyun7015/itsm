import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, TablePagination, TableSortLabel, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel, Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { apiFetch } from '../../utils/api';

function ChangeRequestTable() {
  const [changes, setChanges] = useState([]);
  
  // 페이징 & 정렬 상태
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 
  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('desc'); 

  // 🌟 다중 검색 상태 (위험도, 제목, 상태)
  const [searchRiskLevel, setSearchRiskLevel] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0); 

  // 등록/수정 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ 
    id: null, title: '', reason: '', riskLevel: 'MEDIUM', plan: '', backoutPlan: '', 
    requesterName: '', status: 'CAB_APPROVAL', scheduledAt: '' 
  });

  // 상세/결재 모달 상태
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedChange, setSelectedChange] = useState(null);
  const [reviewComment, setReviewComment] = useState(''); // 반려 시 코멘트 (현재 UI에만 사용)

  const userRole = localStorage.getItem('userRole'); 
  const canEdit = userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN';

  // 🌟 API 호출 (페이징 + 다중 검색)
  const fetchChanges = () => {
    const url = `/changes?page=${page}&size=${rowsPerPage}&sort=${orderBy}&direction=${order}&riskLevel=${searchRiskLevel}&status=${searchStatus}&title=${searchTitle}`;
    apiFetch(url)
      .then(res => res.json())
      .then(data => { 
        setChanges(data.content || []); 
        setTotalElements(data.totalElements || 0); 
      })
      .catch(err => console.error('변경 요청 데이터 로드 실패:', err));
  };

  useEffect(() => { 
    fetchChanges(); 
  }, [page, rowsPerPage, orderBy, order, triggerSearch]); 

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); 
    setOrderBy(property); 
    setPage(0);
  };

  // 상태 뱃지 디자인
  const getStatusColor = (status) => {
    switch(status) {
      case 'CAB_APPROVAL': return { color: 'warning', label: 'CAB 심의 대기' };
      case 'SCHEDULED': return { color: 'info', label: '일정 확정됨' };
      case 'COMPLETED': return { color: 'success', label: '작업 완료' };
      case 'REJECTED': return { color: 'error', label: '반려됨' };
      default: return { color: 'default', label: status };
    }
  };

  // 모달 제어 (등록/수정)
  const handleOpenCreate = () => {
    setFormData({ 
      id: null, title: '', reason: '', riskLevel: 'MEDIUM', plan: '', backoutPlan: '', 
      requesterName: localStorage.getItem('userName') || '', status: 'CAB_APPROVAL', scheduledAt: '' 
    });
    setModalMode('CREATE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, cr) => {
    e.stopPropagation();
    setFormData({ 
      ...cr, 
      scheduledAt: cr.scheduledAt ? cr.scheduledAt.split('T')[0] : '' 
    });
    setModalMode('EDIT');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // 저장 (CREATE / UPDATE)
  const handleSubmit = async () => {
    if (!formData.title || !formData.reason || !formData.plan) return alert('필수 항목을 모두 입력하세요.');
    
    // 날짜 포맷 변환 (yyyy-MM-dd -> yyyy-MM-ddT00:00:00)
    const payload = { ...formData };
    if (payload.scheduledAt && !payload.scheduledAt.includes('T')) {
      payload.scheduledAt = `${payload.scheduledAt}T00:00:00`;
    }

    const url = modalMode === 'CREATE' ? '/changes' : `/changes/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

    try {
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { 
        handleCloseModal(); 
        fetchChanges(); 
      } else alert('저장에 실패했습니다.');
    } catch (error) { console.error(error); }
  };

  // 삭제
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('정말 이 변경 요청(CR)을 삭제하시겠습니까?')) return;
    try {
      const res = await apiFetch(`/changes/${id}`, { method: 'DELETE' });
      if (res.ok) fetchChanges();
      else alert('삭제에 실패했습니다.');
    } catch (error) { console.error(error); }
  };

  // 🌟 상세/결재 모달 핸들러
  const handleOpenDetail = (cr) => {
    setSelectedChange(cr);
    setReviewComment('');
    setIsDetailOpen(true);
  };

  // 🌟 상태 업데이트 (CAB 승인, 완료 처리 등)
  const handleStatusUpdate = async (newStatus) => {
    try {
      // 🌟 DTO 전체를 다시 보내 상태만 덮어쓰도록 구현
      const payload = { ...selectedChange, status: newStatus };
      const res = await apiFetch(`/changes/${selectedChange.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert(`상태가 [${newStatus}] 로 업데이트되었습니다.`);
        setIsDetailOpen(false);
        fetchChanges();
      } else alert('상태 업데이트에 실패했습니다.');
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChangeCircleIcon color="primary" /> 변경 (Change) 목록
        </Typography>
        
        {canEdit && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            신규 변경 요청 (CR)
          </Button>
        )}
      </Box>

      {/* 🌟 다중 조건 검색 바 */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>위험도</InputLabel>
          <Select value={searchRiskLevel} onChange={(e) => setSearchRiskLevel(e.target.value)} label="위험도">
            <MenuItem value=""><em>전체</em></MenuItem>
            <MenuItem value="HIGH">HIGH (높음)</MenuItem>
            <MenuItem value="MEDIUM">MEDIUM (보통)</MenuItem>
            <MenuItem value="LOW">LOW (낮음)</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>진행 상태</InputLabel>
          <Select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} label="진행 상태">
            <MenuItem value=""><em>전체 상태</em></MenuItem>
            <MenuItem value="CAB_APPROVAL">CAB 심의 대기</MenuItem>
            <MenuItem value="SCHEDULED">일정 확정됨</MenuItem>
            <MenuItem value="COMPLETED">작업 완료</MenuItem>
            <MenuItem value="REJECTED">반려됨</MenuItem>
          </Select>
        </FormControl>
        
        <TextField size="small" label="변경 제목 검색" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} sx={{ flexGrow: 1, maxWidth: 300 }} />
        <Button variant="outlined" onClick={() => setTriggerSearch(prev => prev + 1)}>검색</Button>
      </Paper>

      {/* 🌟 데이터 테이블 */}
      <Paper sx={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>CR ID</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'riskLevel'} direction={orderBy === 'riskLevel' ? order : 'asc'} onClick={() => handleSort('riskLevel')}>위험도</TableSortLabel></TableCell>
                <TableCell fontWeight="bold" sx={{ width: '35%' }}><TableSortLabel active={orderBy === 'title'} direction={orderBy === 'title' ? order : 'asc'} onClick={() => handleSort('title')}>변경 제목</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'requesterName'} direction={orderBy === 'requesterName' ? order : 'asc'} onClick={() => handleSort('requesterName')}>요청자</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleSort('status')}>상태</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'scheduledAt'} direction={orderBy === 'scheduledAt' ? order : 'asc'} onClick={() => handleSort('scheduledAt')}>예정일</TableSortLabel></TableCell>
                {canEdit && <TableCell align="center" fontWeight="bold">관리</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {changes.length === 0 ? (
                <TableRow><TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 5 }}>등록된 변경 요청이 없습니다.</TableCell></TableRow>
              ) : changes.map((cr) => {
                const statusInfo = getStatusColor(cr.status);
                return (
                  <TableRow key={cr.id} hover onClick={() => handleOpenDetail(cr)} sx={{ cursor: 'pointer' }}>
                    <TableCell sx={{ color: '#1976d2', fontWeight: '500' }}>CR-{cr.id}</TableCell>
                    <TableCell>
                      <Chip label={cr.riskLevel} size="small" sx={{ fontWeight: 'bold', bgcolor: cr.riskLevel === 'HIGH' ? '#fee2e2' : '#f1f5f9', color: cr.riskLevel === 'HIGH' ? '#ef4444' : '#64748b' }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{cr.title}</TableCell>
                    <TableCell>{cr.requesterName}</TableCell>
                    <TableCell><Chip label={statusInfo.label} color={statusInfo.color} size="small" variant="outlined" sx={{ fontWeight: 'bold' }} /></TableCell>
                    <TableCell>{cr.scheduledAt ? cr.scheduledAt.split('T')[0] : '미정'}</TableCell>
                    
                    {canEdit && (
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={(e) => handleOpenEdit(e, cr)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={(e) => handleDelete(e, cr.id)}><DeleteIcon fontSize="small" /></IconButton>
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

      {/* 🌟 등록 및 수정 모달 (작성 폼) */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold' }}>{modalMode === 'CREATE' ? '신규 변경 요청서 (CR) 작성' : '변경 요청서 수정'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="요청자" name="requesterName" value={formData.requesterName} onChange={handleChange} fullWidth required />
              <TextField label="변경 예정일" name="scheduledAt" type="date" value={formData.scheduledAt} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>위험도 (Risk Level)</InputLabel>
                <Select name="riskLevel" value={formData.riskLevel} onChange={handleChange} label="위험도 (Risk Level)">
                  <MenuItem value="LOW">LOW (낮음 - 단순 구성 변경)</MenuItem>
                  <MenuItem value="MEDIUM">MEDIUM (보통 - 일부 서비스 재시작)</MenuItem>
                  <MenuItem value="HIGH">HIGH (높음 - 전체 서비스 중단 동반)</MenuItem>
                </Select>
              </FormControl>
              {modalMode === 'EDIT' && (
                <FormControl fullWidth>
                  <InputLabel>진행 상태</InputLabel>
                  <Select name="status" value={formData.status} onChange={handleChange} label="진행 상태">
                    <MenuItem value="CAB_APPROVAL">CAB 심의 대기</MenuItem>
                    <MenuItem value="SCHEDULED">일정 확정됨</MenuItem>
                    <MenuItem value="COMPLETED">작업 완료</MenuItem>
                    <MenuItem value="REJECTED">반려됨</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
            <TextField label="변경 제목" name="title" value={formData.title} onChange={handleChange} fullWidth required placeholder="예: DB 서버 정기 보안 패치" />
            <TextField label="1. 변경 사유 및 목적" name="reason" value={formData.reason} onChange={handleChange} fullWidth multiline rows={2} required />
            <TextField label="2. 실행 계획 (Action Plan)" name="plan" value={formData.plan} onChange={handleChange} fullWidth multiline rows={3} placeholder="작업 순서와 절차를 상세히 기술하세요" required />
            <TextField label="3. 원복 계획 (Backout Plan)" name="backoutPlan" value={formData.backoutPlan} onChange={handleChange} fullWidth multiline rows={2} placeholder="작업 실패 시 이전 상태로 되돌리는 절차" required />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">{modalMode === 'CREATE' ? '제출 (CAB 심의 요청)' : '수정 내역 저장'}</Button>
        </DialogActions>
      </Dialog>

      {/* 🌟 결재 및 상세 조회 모달 (읽기 전용 + 결재 버튼) */}
      {selectedChange && (
        <Dialog open={isDetailOpen} onClose={() => setIsDetailOpen(false)} fullWidth maxWidth="md">
          <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>변경 요청 상세 (CR-{selectedChange.id})</span>
            <Chip label={getStatusColor(selectedChange.status).label} color={getStatusColor(selectedChange.status).color} sx={{ fontWeight: 'bold' }} />
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="body2"><strong>요청자:</strong> {selectedChange.requesterName}</Typography>
              <Typography variant="body2"><strong>변경 예정일:</strong> {selectedChange.scheduledAt ? selectedChange.scheduledAt.split('T')[0] : '미정'}</Typography>
              <Typography variant="body2" sx={{ gridColumn: '1 / -1' }}>
                <strong>위험도:</strong> <span style={{ color: selectedChange.riskLevel === 'HIGH' ? '#ef4444' : 'inherit', fontWeight: 'bold' }}>{selectedChange.riskLevel}</span>
              </Typography>
              <Typography variant="body1" sx={{ gridColumn: '1 / -1', fontWeight: 'bold', color: 'primary.main', mt: 1 }}>{selectedChange.title}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>1. 변경 사유 및 목적</Typography>
              <Typography variant="body2" sx={{ p: 1.5, bgcolor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: 1, whiteSpace: 'pre-wrap' }}>{selectedChange.reason}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>2. 실행 계획 (Action Plan)</Typography>
              <Typography variant="body2" sx={{ p: 1.5, bgcolor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: 1, whiteSpace: 'pre-wrap' }}>{selectedChange.plan}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>3. 원복 계획 (Backout Plan)</Typography>
              <Typography variant="body2" sx={{ p: 1.5, bgcolor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: 1, whiteSpace: 'pre-wrap' }}>{selectedChange.backoutPlan}</Typography>
            </Box>

            {/* 승인 대기 상태일 때 CAB 결재 영역 노출 */}
            {selectedChange.status === 'CAB_APPROVAL' && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#fef3c7', borderRadius: 2, border: '1px solid #fcd34d' }}>
                <Typography variant="subtitle2" fontWeight="bold" color="#d97706" mb={1}>CAB (변경 승인 위원회) 결재</Typography>
                <TextField 
                  fullWidth size="small" placeholder="반려 시 사유를 입력하세요..." 
                  value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} sx={{ bgcolor: 'white', mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button fullWidth variant="contained" color="success" onClick={() => handleStatusUpdate('SCHEDULED')} startIcon={<CheckCircleIcon />}>승인 (일정 확정)</Button>
                  <Button fullWidth variant="contained" color="error" onClick={() => handleStatusUpdate('REJECTED')} startIcon={<CancelIcon />}>반려 (Reject)</Button>
                </Box>
              </Box>
            )}

            {/* 일정 확정 상태일 때 작업 완료 영역 노출 */}
            {selectedChange.status === 'SCHEDULED' && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" color="primary" onClick={() => handleStatusUpdate('COMPLETED')} sx={{ px: 4, py: 1, fontSize: '1.1rem' }}>
                  ✅ 변경 작업 완료 처리
                </Button>
              </Box>
            )}

          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setIsDetailOpen(false)} color="inherit" variant="outlined">닫기</Button>
          </DialogActions>
        </Dialog>
      )}

    </Box>
  );
}

export default ChangeRequestTable;