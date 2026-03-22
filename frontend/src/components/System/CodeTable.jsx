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

function CodeTable() {
  const [codes, setCodes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 
  const [orderBy, setOrderBy] = useState('groupCode'); 
  const [order, setOrder] = useState('asc'); 

  const [searchGroup, setSearchGroup] = useState('');
  const [searchName, setSearchName] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ id: null, groupCode: '', codeValue: '', codeName: '', description: '', useYn: 'Y' });

  const fetchCodes = () => {
    const url = `/system/codes?page=${page}&size=${rowsPerPage}&sort=${orderBy}&dir=${order}&groupCode=${searchGroup}&codeName=${searchName}`;
    apiFetch(url).then(res => res.json())
      .then(data => { setCodes(data.content || []); setTotalElements(data.totalElements || 0); })
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchCodes(); }, [page, rowsPerPage, orderBy, order, triggerSearch]); 

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); setOrderBy(property); setPage(0);
  };

  const handleOpenCreate = () => {
    setFormData({ id: null, groupCode: '', codeValue: '', codeName: '', description: '', useYn: 'Y' });
    setModalMode('CREATE'); setIsModalOpen(true);
  };

  const handleOpenEdit = (code) => {
    setFormData({ ...code });
    setModalMode('EDIT'); setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.groupCode || !formData.codeValue) return alert('그룹 코드와 코드 값은 필수입니다.');
    const url = modalMode === 'CREATE' ? '/system/codes' : `/system/codes/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

    try {
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { setIsModalOpen(false); fetchCodes(); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 코드를 삭제하시겠습니까?')) return;
    try {
      const res = await apiFetch(`/system/codes/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCodes();
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField size="small" label="그룹 코드 검색" value={searchGroup} onChange={(e) => setSearchGroup(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} />
        <TextField size="small" label="코드명(한글) 검색" value={searchName} onChange={(e) => setSearchName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} />
        <Button variant="outlined" onClick={() => setTriggerSearch(prev => prev + 1)}>검색</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>신규 공통 코드</Button>
      </Box>

      <Paper sx={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>ID</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'groupCode'} direction={orderBy === 'groupCode' ? order : 'asc'} onClick={() => handleSort('groupCode')}>그룹 코드</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'codeValue'} direction={orderBy === 'codeValue' ? order : 'asc'} onClick={() => handleSort('codeValue')}>코드 값</TableSortLabel></TableCell>
                <TableCell fontWeight="bold">코드 명 (한글)</TableCell>
                <TableCell fontWeight="bold">설명</TableCell>
                <TableCell fontWeight="bold">사용 여부</TableCell>
                <TableCell align="center" fontWeight="bold">관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {codes.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{c.groupCode}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{c.codeValue}</TableCell>
                  <TableCell sx={{ color: '#059669', fontWeight: 'bold' }}>{c.codeName}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell>
                    <Chip label={c.useYn === 'Y' ? '사용 중' : '미사용'} size="small" color={c.useYn === 'Y' ? 'success' : 'error'} />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(c)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={totalElements} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} />
      </Paper>

      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>{modalMode === 'CREATE' ? '신규 공통 코드 등록' : '공통 코드 수정'}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="그룹 코드 (예: PRIORITY)" value={formData.groupCode} onChange={(e) => setFormData({...formData, groupCode: e.target.value})} fullWidth required />
            <TextField label="코드 값 (예: HIGH)" value={formData.codeValue} onChange={(e) => setFormData({...formData, codeValue: e.target.value})} fullWidth required />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="코드 명 (한글)" value={formData.codeName} onChange={(e) => setFormData({...formData, codeName: e.target.value})} fullWidth required />
            <FormControl fullWidth>
              <InputLabel>사용 여부</InputLabel>
              <Select value={formData.useYn} onChange={(e) => setFormData({...formData, useYn: e.target.value})} label="사용 여부">
                <MenuItem value="Y">사용 (Y)</MenuItem>
                <MenuItem value="N">미사용 (N)</MenuItem>
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

export default CodeTable;