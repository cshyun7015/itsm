import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, TablePagination, TableSortLabel, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExtensionIcon from '@mui/icons-material/Extension';
import { apiFetch } from '../../utils/api';

function ProblemTable() {
  const [problems, setProblems] = useState([]);
  
  // 페이징 & 정렬 상태
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 
  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('desc'); 

  // 검색 상태
  const [searchStatus, setSearchStatus] = useState('');
  const [searchTitle, setSearchTitle] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0); 

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ 
    id: null, title: '', description: '', status: 'OPEN', priority: 'MEDIUM', 
    rootCause: '', workaround: '', managerName: '', targetResolutionDate: '' 
  });

  const userRole = localStorage.getItem('userRole'); 
  const canEdit = userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN';

  // 🌟 백엔드의 서버 사이드 페이징 및 검색 API 호출
  const fetchProblems = () => {
    const url = `/problems?page=${page}&size=${rowsPerPage}&sort=${orderBy}&direction=${order}&status=${searchStatus}&title=${searchTitle}`;
    apiFetch(url)
      .then(res => res.json())
      .then(data => { 
        setProblems(data.content || []); 
        setTotalElements(data.totalElements || 0); 
      })
      .catch(err => console.error('문제 데이터 로드 실패:', err));
  };

  useEffect(() => { 
    fetchProblems(); 
  }, [page, rowsPerPage, orderBy, order, triggerSearch]); 

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); 
    setOrderBy(property); 
    setPage(0);
  };

  // 🌟 문제(Problem) 상태별 뱃지 스타일
  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return { color: 'error', label: '신규 접수' };
      case 'INVESTIGATING': return { color: 'info', label: '원인 분석 중' };
      case 'KNOWN_ERROR': return { color: 'warning', label: '알려진 오류(KE)' };
      case 'RESOLVED': return { color: 'success', label: '영구 해결됨' };
      default: return { color: 'default', label: status };
    }
  };

  const handleOpenCreate = () => {
    setFormData({ 
      id: null, title: '', description: '', status: 'OPEN', priority: 'MEDIUM', 
      rootCause: '', workaround: '', managerName: localStorage.getItem('userName') || '', targetResolutionDate: '' 
    });
    setModalMode('CREATE');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e, prob) => {
    e.stopPropagation();
    setFormData({ 
      id: prob.id, title: prob.title, description: prob.description || '', 
      status: prob.status, priority: prob.priority || 'MEDIUM', 
      rootCause: prob.rootCause || '', workaround: prob.workaround || '', 
      managerName: prob.managerName || '', 
      targetResolutionDate: prob.targetResolutionDate ? prob.targetResolutionDate.split('T')[0] : '' 
    });
    setModalMode('EDIT');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // 등록 및 수정 처리
  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return alert('제목과 상세 현상을 입력하세요.');
    
    const url = modalMode === 'CREATE' ? '/problems' : `/problems/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

    try {
      const res = await apiFetch(url, { 
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData) 
      });
      if (res.ok) { 
        handleCloseModal(); 
        fetchProblems(); 
      } else alert('저장에 실패했습니다.');
    } catch (error) { console.error(error); }
  };

  // 삭제 처리
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('정말 이 문제(Problem) 데이터를 삭제하시겠습니까?')) return;
    try {
      const res = await apiFetch(`/problems/${id}`, { method: 'DELETE' });
      if (res.ok) fetchProblems();
      else alert('삭제에 실패했습니다.');
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      {/* 상단 액션 바 및 검색 영역 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ExtensionIcon color="primary" /> 문제 (Problem) 목록
        </Typography>
        
        {canEdit && (
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            신규 문제 등록
          </Button>
        )}
      </Box>

      {/* 🌟 다중 조건 검색 바 */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', bgcolor: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>상태 검색</InputLabel>
          <Select value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)} label="상태 검색">
            <MenuItem value=""><em>전체 상태</em></MenuItem>
            <MenuItem value="OPEN">신규 접수 (OPEN)</MenuItem>
            <MenuItem value="INVESTIGATING">원인 분석 중 (INVESTIGATING)</MenuItem>
            <MenuItem value="KNOWN_ERROR">알려진 오류 (KNOWN_ERROR)</MenuItem>
            <MenuItem value="RESOLVED">영구 해결됨 (RESOLVED)</MenuItem>
          </Select>
        </FormControl>
        
        <TextField 
          size="small" label="문제 제목 검색" value={searchTitle} 
          onChange={(e) => setSearchTitle(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)}
          sx={{ flexGrow: 1, maxWidth: 400 }}
        />
        <Button variant="outlined" onClick={() => setTriggerSearch(prev => prev + 1)}>검색</Button>
      </Paper>

      {/* 데이터 테이블 */}
      <Paper sx={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>ID</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleSort('status')}>상태</TableSortLabel></TableCell>
                <TableCell fontWeight="bold" sx={{ width: '30%' }}><TableSortLabel active={orderBy === 'title'} direction={orderBy === 'title' ? order : 'asc'} onClick={() => handleSort('title')}>문제 제목 (현상)</TableSortLabel></TableCell>
                <TableCell fontWeight="bold">임시 해결책(Workaround)</TableCell>
                <TableCell fontWeight="bold">근본 원인(Root Cause)</TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'createdAt'} direction={orderBy === 'createdAt' ? order : 'asc'} onClick={() => handleSort('createdAt')}>등록일</TableSortLabel></TableCell>
                {canEdit && <TableCell align="center" fontWeight="bold">관리</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {problems.length === 0 ? (
                <TableRow><TableCell colSpan={canEdit ? 7 : 6} align="center" sx={{ py: 5 }}>등록된 문제가 없습니다.</TableCell></TableRow>
              ) : problems.map((prob) => {
                const statusInfo = getStatusColor(prob.status);
                return (
                  <TableRow key={prob.id} hover>
                    <TableCell sx={{ color: '#1976d2', fontWeight: '500' }}>PRB-{prob.id}</TableCell>
                    <TableCell>
                      <Chip label={statusInfo.label} color={statusInfo.color} size="small" sx={{ fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: 'text.primary' }}>{prob.title}</TableCell>
                    
                    <TableCell>
                      {prob.workaround ? <Chip label="가이드 있음" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 'bold' }}/> : <Typography variant="caption" color="text.secondary">-</Typography>}
                    </TableCell>
                    
                    <TableCell>
                      {prob.rootCause ? <Chip label="파악 완료" size="small" sx={{ bgcolor: '#e0e7ff', color: '#3730a3', fontWeight: 'bold' }}/> : <Typography variant="caption" color="text.secondary">분석 중...</Typography>}
                    </TableCell>
                    
                    <TableCell>{prob.createdAt ? prob.createdAt.split('T')[0] : '-'}</TableCell>
                    
                    {canEdit && (
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={(e) => handleOpenEdit(e, prob)}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" color="error" onClick={(e) => handleDelete(e, prob.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* 서버 연동 페이징 */}
        <TablePagination 
          component="div" count={totalElements} page={page} 
          onPageChange={(e, p) => setPage(p)} 
          rowsPerPage={rowsPerPage} 
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} 
          rowsPerPageOptions={[5, 10, 25]} 
        />
      </Paper>

      {/* 등록 및 수정 모달 */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {modalMode === 'CREATE' ? '신규 문제(Problem) 등록' : '문제 상세 및 원인 분석 업데이트'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>현재 상태</InputLabel>
                <Select name="status" value={formData.status} onChange={handleChange} label="현재 상태">
                  <MenuItem value="OPEN">신규 접수 (OPEN)</MenuItem>
                  <MenuItem value="INVESTIGATING">원인 분석 중 (INVESTIGATING)</MenuItem>
                  <MenuItem value="KNOWN_ERROR">알려진 오류 (KNOWN_ERROR)</MenuItem>
                  <MenuItem value="RESOLVED">영구 해결됨 (RESOLVED)</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>우선순위</InputLabel>
                <Select name="priority" value={formData.priority} onChange={handleChange} label="우선순위">
                  <MenuItem value="LOW">LOW (낮음)</MenuItem>
                  <MenuItem value="MEDIUM">MEDIUM (보통)</MenuItem>
                  <MenuItem value="HIGH">HIGH (높음)</MenuItem>
                  <MenuItem value="CRITICAL">CRITICAL (긴급)</MenuItem>
                </Select>
              </FormControl>

              <TextField label="담당자" name="managerName" value={formData.managerName} onChange={handleChange} fullWidth />
              <TextField label="목표 해결일" name="targetResolutionDate" type="date" value={formData.targetResolutionDate} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} />
            </Box>

            <TextField label="문제 제목 (발생 현상 요약)" name="title" value={formData.title} onChange={handleChange} fullWidth required />
            <TextField label="상세 현상 및 영향도" name="description" value={formData.description} onChange={handleChange} fullWidth multiline rows={3} required placeholder="반복적으로 발생하는 장애 현상이나 인프라 결함 내용을 기재하세요." />
            
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
              <Typography variant="subtitle2" color="primary" fontWeight="bold" mb={1}>💡 임시 해결책 (Workaround)</Typography>
              <TextField name="workaround" value={formData.workaround} onChange={handleChange} fullWidth multiline rows={2} placeholder="근본 원인이 해결되기 전, 서비스 복구를 위해 즉시 적용할 수 있는 임시 조치 가이드를 작성하세요." />
            </Box>

            <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px dashed #bbf7d0' }}>
              <Typography variant="subtitle2" color="success.main" fontWeight="bold" mb={1}>🔍 근본 원인 (Root Cause)</Typography>
              <TextField name="rootCause" value={formData.rootCause} onChange={handleChange} fullWidth multiline rows={2} placeholder="분석이 완료된 장애의 근본 원인을 기재하세요." />
            </Box>

          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} color="inherit">취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {modalMode === 'CREATE' ? '문제 등록' : '업데이트 저장'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProblemTable;