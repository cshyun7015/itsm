import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, 
  InputLabel, TablePagination, TableSortLabel 
} from '@mui/material'; // 🌟 TableSortLabel 추가
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { apiFetch } from '../../utils/api'; 

function EventConsole() {
  const [events, setEvents] = useState([]);
  
  // 페이징 상태
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 

  // 🌟 정렬 상태 추가 (기본값: ID 내림차순)
  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('desc'); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ id: null, source: '', severity: 'WARNING', message: '', node: '', status: 'NEW' });

  const userRole = localStorage.getItem('userRole'); 
  const canEdit = userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN';
  const canDelete = userRole === 'ROLE_ADMIN';

  // 🌟 정렬 파라미터(sort, direction)를 API URL에 추가
  const fetchEvents = () => {
    apiFetch(`/events?page=${page}&size=${rowsPerPage}&sort=${orderBy}&direction=${order}`)
      .then(res => res.json())
      .then(data => {
        setEvents(data.content);         
        setTotalElements(data.totalElements); 
      })
      .catch(err => console.error('이벤트 로드 실패:', err));
  };

  // 🌟 orderBy와 order가 바뀔 때도 데이터를 다시 불러오도록 의존성 배열에 추가
  useEffect(() => {
    fetchEvents();
  }, [page, rowsPerPage, orderBy, order]);

  // 🌟 테이블 헤더 클릭 시 정렬 방향/컬럼을 변경하는 핸들러
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); // 누를 때마다 방향 토글
    setOrderBy(property);             // 정렬 기준 컬럼 변경
    setPage(0);                       // 정렬이 바뀌면 1페이지로 리셋
  };

  const getSeverityStyle = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return { bgcolor: '#fee2e2', color: '#dc2626', border: '1px solid #f87171' };
      case 'WARNING': return { bgcolor: '#fef3c7', color: '#d97706', border: '1px solid #fbbf24' };
      case 'INFO': return { bgcolor: '#dbeafe', color: '#2563eb', border: '1px solid #60a5fa' };
      default: return { bgcolor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1' };
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); 
  };

  const handleOpenCreate = () => {
    setFormData({ id: null, source: '', severity: 'WARNING', message: '', node: '', status: 'NEW' });
    setModalMode('CREATE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setFormData({ ...event });
    setModalMode('EDIT');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    const url = modalMode === 'CREATE' ? '/events' : `/events/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';
    try {
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) {
        handleCloseModal();
        fetchEvents();
      } else if (res.status === 403) alert('권한이 없습니다.');
      else alert('저장에 실패했습니다.');
    } catch (error) { console.error('저장 에러:', error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 이 이벤트를 삭제하시겠습니까? (관리자 전용)')) return;
    try {
      const res = await apiFetch(`/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (events.length === 1 && page > 0) setPage(page - 1);
        else fetchEvents();
      } else if (res.status === 403) alert('삭제 권한이 없습니다.');
      else alert('삭제에 실패했습니다.');
    } catch (error) { console.error('삭제 에러:', error); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          🚨 이벤트 (Event) 목록
        </Typography>
        {canEdit && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            수동 이벤트 등록
          </Button>
        )}
      </Box>

      <Paper sx={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                {/* 🌟 각 TableCell에 TableSortLabel을 적용합니다. */}
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel active={orderBy === 'severity'} direction={orderBy === 'severity' ? order : 'asc'} onClick={() => handleSort('severity')}>
                    심각도
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel active={orderBy === 'source'} direction={orderBy === 'source' ? order : 'asc'} onClick={() => handleSort('source')}>
                    발생 소스
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel active={orderBy === 'node'} direction={orderBy === 'node' ? order : 'asc'} onClick={() => handleSort('node')}>
                    발생 노드
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel active={orderBy === 'message'} direction={orderBy === 'message' ? order : 'asc'} onClick={() => handleSort('message')}>
                    메시지
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleSort('status')}>
                    상태
                  </TableSortLabel>
                </TableCell>
                {canEdit && <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>관리</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 5, color: 'text.secondary' }}>현재 수신된 이벤트가 없습니다.</TableCell>
                </TableRow>
              ) : (
                events.map((ev) => (
                  <TableRow key={ev.id} hover>
                    <TableCell>EVT-{ev.id}</TableCell>
                    <TableCell><Chip label={ev.severity} size="small" sx={{ fontWeight: 'bold', ...getSeverityStyle(ev.severity) }} /></TableCell>
                    <TableCell>{ev.source}</TableCell>
                    <TableCell>{ev.node || '-'}</TableCell>
                    <TableCell>{ev.message}</TableCell>
                    <TableCell><Chip label={ev.status} variant="outlined" size="small" sx={{ color: 'text.secondary', borderColor: 'divider' }} /></TableCell>
                    {canEdit && (
                      <TableCell align="center">
                        <IconButton color="primary" onClick={() => handleOpenEdit(ev)} size="small"><EditIcon fontSize="small" /></IconButton>
                        {canDelete && <IconButton color="error" onClick={() => handleDelete(ev.id)} size="small"><DeleteIcon fontSize="small" /></IconButton>}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={totalElements}      
          page={page}                
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}  
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="페이지당 표시:"
        />
      </Paper>

      {/* 모달(Dialog) 코드는 기존과 완벽히 동일하므로 생략 없이 그대로 유지됩니다. */}
      {/* (위 기존 코드에 이어 붙어있는 형태입니다) */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>{modalMode === 'CREATE' ? '신규 이벤트 등록' : '이벤트 수정'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField label="발생 소스" name="source" value={formData.source} onChange={handleChange} fullWidth />
            <TextField label="발생 노드" name="node" value={formData.node} onChange={handleChange} fullWidth />
            <FormControl fullWidth>
              <InputLabel>심각도 (Severity)</InputLabel>
              <Select name="severity" value={formData.severity} onChange={handleChange} label="심각도 (Severity)">
                <MenuItem value="INFO">INFO (정보)</MenuItem>
                <MenuItem value="WARNING">WARNING (경고)</MenuItem>
                <MenuItem value="CRITICAL">CRITICAL (심각)</MenuItem>
              </Select>
            </FormControl>
            <TextField label="메시지" name="message" value={formData.message} onChange={handleChange} fullWidth multiline rows={3} />
            {modalMode === 'EDIT' && (
              <FormControl fullWidth>
                <InputLabel>상태 (Status)</InputLabel>
                <Select name="status" value={formData.status} onChange={handleChange} label="상태 (Status)">
                  <MenuItem value="NEW">NEW (신규)</MenuItem>
                  <MenuItem value="ACKNOWLEDGED">ACKNOWLEDGED (인지됨)</MenuItem>
                  <MenuItem value="RESOLVED">RESOLVED (해결됨)</MenuItem>
                  <MenuItem value="IGNORED">IGNORED (무시됨)</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">{modalMode === 'CREATE' ? '등록하기' : '수정하기'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EventConsole;