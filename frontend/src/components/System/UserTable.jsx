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

function UserTable() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 
  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('desc'); 

  // 검색 상태
  const [searchUsername, setSearchUsername] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchDept, setSearchDept] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ 
    id: null, username: '', name: '', department: '', password: '', role: 'ROLE_USER', status: 'ACTIVE' 
  });

  const fetchUsers = () => {
    const url = `/system/users?page=${page}&size=${rowsPerPage}&sort=${orderBy}&dir=${order}&username=${searchUsername}&name=${searchName}&department=${searchDept}&role=${searchRole}`;
    apiFetch(url).then(res => res.json())
      .then(data => { setUsers(data.content || []); setTotalElements(data.totalElements || 0); })
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchUsers(); }, [page, rowsPerPage, orderBy, order, triggerSearch]); 

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); setOrderBy(property); setPage(0);
  };

  const handleOpenCreate = () => {
    setFormData({ id: null, username: '', name: '', department: '', password: '', role: 'ROLE_USER', status: 'ACTIVE' });
    setModalMode('CREATE'); setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setFormData({ ...user, password: '' }); // 비밀번호는 비워둠 (입력 시에만 변경되도록)
    setModalMode('EDIT'); setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.name) return alert('아이디와 이름은 필수입니다.');
    if (modalMode === 'CREATE' && !formData.password) return alert('신규 생성 시 비밀번호는 필수입니다.');

    const url = modalMode === 'CREATE' ? '/system/users' : `/system/users/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

    try {
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { setIsModalOpen(false); fetchUsers(); }
      else alert('저장에 실패했습니다. 아이디 중복 등을 확인하세요.');
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 사용자를 삭제하시겠습니까?')) return;
    try {
      const res = await apiFetch(`/system/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField size="small" label="아이디 검색" value={searchUsername} onChange={(e) => setSearchUsername(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} sx={{ width: 150 }} />
        <TextField size="small" label="이름 검색" value={searchName} onChange={(e) => setSearchName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} sx={{ width: 150 }} />
        <TextField size="small" label="부서 검색" value={searchDept} onChange={(e) => setSearchDept(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} sx={{ width: 150 }} />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>권한</InputLabel>
          <Select value={searchRole} onChange={(e) => setSearchRole(e.target.value)} label="권한">
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="ROLE_ADMIN">관리자</MenuItem>
            <MenuItem value="ROLE_AGENT">담당자</MenuItem>
            <MenuItem value="ROLE_USER">일반사용자</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={() => setTriggerSearch(prev => prev + 1)}>검색</Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>신규 사용자</Button>
      </Box>

      <Paper sx={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>ID</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'username'} direction={orderBy === 'username' ? order : 'asc'} onClick={() => handleSort('username')}>로그인 ID</TableSortLabel></TableCell>
                <TableCell fontWeight="bold">이름</TableCell>
                <TableCell fontWeight="bold">부서</TableCell>
                <TableCell fontWeight="bold">권한</TableCell>
                <TableCell fontWeight="bold">상태</TableCell>
                <TableCell align="center" fontWeight="bold">관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.id}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>{u.username}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.department}</TableCell>
                  <TableCell>
                    <Chip label={u.role.replace('ROLE_', '')} size="small" sx={{ bgcolor: u.role === 'ROLE_ADMIN' ? '#fee2e2' : u.role === 'ROLE_AGENT' ? '#dbeafe' : '#f1f5f9', color: u.role === 'ROLE_ADMIN' ? '#ef4444' : u.role === 'ROLE_AGENT' ? '#3b82f6' : '#64748b', fontWeight: 'bold' }} />
                  </TableCell>
                  <TableCell><Chip label={u.status === 'ACTIVE' ? '정상' : '정지'} size="small" color={u.status === 'ACTIVE' ? 'success' : 'default'} /></TableCell>
                  <TableCell align="center">
                    <IconButton size="small" color="primary" onClick={() => handleOpenEdit(u)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(u.id)}><DeleteIcon fontSize="small" /></IconButton>
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
        <DialogTitle sx={{ fontWeight: 'bold' }}>{modalMode === 'CREATE' ? '신규 사용자 등록' : '사용자 정보 수정'}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="로그인 ID" name="username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} fullWidth required disabled={modalMode === 'EDIT'} />
            <TextField label="이름" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} fullWidth required />
          </Box>
          <TextField label={modalMode === 'CREATE' ? '비밀번호 (필수)' : '새 비밀번호 (변경 시에만 입력)'} type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} fullWidth required={modalMode === 'CREATE'} />
          <TextField label="소속 부서" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>권한 (Role)</InputLabel>
              <Select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} label="권한 (Role)">
                <MenuItem value="ROLE_USER">일반 사용자 (USER)</MenuItem>
                <MenuItem value="ROLE_AGENT">IT 담당자 (AGENT)</MenuItem>
                <MenuItem value="ROLE_ADMIN">시스템 관리자 (ADMIN)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>계정 상태</InputLabel>
              <Select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} label="계정 상태">
                <MenuItem value="ACTIVE">정상 (ACTIVE)</MenuItem>
                <MenuItem value="INACTIVE">정지 (INACTIVE)</MenuItem>
              </Select>
            </FormControl>
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

export default UserTable;