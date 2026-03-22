import React, { useState, useEffect } from 'react';
import { 
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, TablePagination, TableSortLabel, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { apiFetch } from '../../utils/api';

function CompanyTable() {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 
  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('desc'); 

  const [searchName, setSearchName] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ id: null, name: '', code: '', address: '', domain: '', managerName: '' });

  const fetchCompanies = () => {
    const url = `/system/companies?page=${page}&size=${rowsPerPage}&sort=${orderBy}&dir=${order}&name=${searchName}&code=${searchCode}`;
    apiFetch(url).then(res => res.json())
      .then(data => { setCompanies(data.content || []); setTotalElements(data.totalElements || 0); })
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchCompanies(); }, [page, rowsPerPage, orderBy, order, triggerSearch]); 

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); setOrderBy(property); setPage(0);
  };

  const handleOpenCreate = () => {
    setFormData({ id: null, name: '', code: '', address: '', domain: '', managerName: '' });
    setModalMode('CREATE'); setIsModalOpen(true);
  };

  const handleOpenEdit = (comp) => {
    setFormData({ ...comp });
    setModalMode('EDIT'); setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) return alert('고객사명은 필수입니다.');
    const url = modalMode === 'CREATE' ? '/system/companies' : `/system/companies/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

    try {
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { setIsModalOpen(false); fetchCompanies(); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 고객사를 삭제하시겠습니까? 관련 데이터가 함께 삭제될 수 있습니다.')) return;
    try {
      const res = await apiFetch(`/system/companies/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCompanies();
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField size="small" label="고객사명 검색" value={searchName} onChange={(e) => setSearchName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} />
        <TextField size="small" label="식별 코드 검색" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} />
        <Button variant="outlined" onClick={() => setTriggerSearch(prev => prev + 1)}>검색</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>신규 고객사</Button>
      </Box>

      <Paper sx={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>ID</TableSortLabel></TableCell>
                <TableCell fontWeight="bold">고객사명</TableCell>
                <TableCell fontWeight="bold">식별 코드</TableCell>
                <TableCell fontWeight="bold">주소</TableCell>
                <TableCell fontWeight="bold">메일 도메인</TableCell>
                <TableCell fontWeight="bold">담당자명</TableCell>
                <TableCell align="center" fontWeight="bold">관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{c.name}</TableCell>
                  <TableCell>{c.code || '-'}</TableCell>
                  <TableCell>{c.address || '-'}</TableCell>
                  <TableCell>{c.domain || '-'}</TableCell>
                  <TableCell>{c.managerName || '-'}</TableCell>
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

      {/* 등록/수정 모달 */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>{modalMode === 'CREATE' ? '신규 고객사 등록' : '고객사 정보 수정'}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="고객사명" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} fullWidth required />
            <TextField label="식별 코드 (선택)" name="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} fullWidth />
          </Box>
          <TextField label="주소" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="메일 도메인 (예: @google.com)" value={formData.domain} onChange={(e) => setFormData({...formData, domain: e.target.value})} fullWidth />
            <TextField label="고객사 측 IT 담당자명" value={formData.managerName} onChange={(e) => setFormData({...formData, managerName: e.target.value})} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsModalOpen(false)}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">저장</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CompanyTable;