import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, Chip, TablePagination, TableSortLabel, Button, TextField, Select, MenuItem, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { apiFetch } from '../../utils/api';

// 🌟 모달 컴포넌트들을 Table 내부로 불러옵니다!
import IncidentRegistrationModal from './IncidentRegistrationModal';
import IncidentDetailModal from './IncidentDetailModal';

function IncidentTable() {
  const [incidents, setIncidents] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 
  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('desc'); 

  const [searchType, setSearchType] = useState('requester');
  const [keyword, setKeyword] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0); 

  // 🌟 테이블이 스스로 관리할 모달 상태 추가!
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isRegModalOpen, setRegModalOpen] = useState(false);

  const fetchIncidents = () => {
    apiFetch(`/incidents?page=${page}&size=${rowsPerPage}&sort=${orderBy}&direction=${order}&searchType=${searchType}&keyword=${keyword}`)
      .then(res => res.json())
      .then(data => { 
        setIncidents(data.content); 
        setTotalElements(data.totalElements); 
      })
      .catch(err => console.error('장애 목록 로드 실패:', err));
  };

  useEffect(() => { 
    fetchIncidents(); 
  }, [page, rowsPerPage, orderBy, order, triggerSearch]); 

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc'); 
    setOrderBy(property); 
    setPage(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'error';
      case 'IN_PROGRESS': return 'warning';
      case 'RESOLVED': return 'success';
      case 'CLOSED': return 'default';
      default: return 'primary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'success';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select value={searchType} onChange={(e) => setSearchType(e.target.value)}>
              <MenuItem value="requester">요청자명</MenuItem>
            </Select>
          </FormControl>
          <TextField 
            size="small" placeholder="검색어 입력..." value={keyword} 
            onChange={(e) => setKeyword(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)}
          />
          <Button variant="outlined" onClick={() => setTriggerSearch(prev => prev + 1)}>검색</Button>
        </Box>
        <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={() => setRegModalOpen(true)}>
          신규 장애 접수
        </Button>
      </Box>

      <Paper sx={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>ID</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'title'} direction={orderBy === 'title' ? order : 'asc'} onClick={() => handleSort('title')}>제목</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleSort('status')}>상태</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'priority'} direction={orderBy === 'priority' ? order : 'asc'} onClick={() => handleSort('priority')}>심각도</TableSortLabel></TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'requesterName'} direction={orderBy === 'requesterName' ? order : 'asc'} onClick={() => handleSort('requesterName')}>요청자</TableSortLabel></TableCell>
                <TableCell fontWeight="bold">담당자</TableCell>
                <TableCell fontWeight="bold"><TableSortLabel active={orderBy === 'createdAt'} direction={orderBy === 'createdAt' ? order : 'asc'} onClick={() => handleSort('createdAt')}>발생일시</TableSortLabel></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5 }}>등록된 장애가 없습니다.</TableCell></TableRow>
              ) : (
                incidents.map((ticket) => (
                  <TableRow key={ticket.id} hover onClick={() => setSelectedTicket(ticket)} sx={{ cursor: 'pointer' }}>
                    <TableCell sx={{ color: '#1976d2', fontWeight: '500' }}>INC-{ticket.id}</TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell><Chip label={ticket.status} color={getStatusColor(ticket.status)} size="small" sx={{ fontWeight: 'bold' }} /></TableCell>
                    <TableCell><Chip label={ticket.priority} color={getPriorityColor(ticket.priority)} variant="outlined" size="small" sx={{ fontWeight: 'bold', borderWidth: '2px' }} /></TableCell>
                    <TableCell>{ticket.requesterName || '-'}</TableCell>
                    <TableCell>{ticket.assigneeName || '미할당'}</TableCell>
                    <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={totalElements} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10, 25]} />
      </Paper>

      {/* 🌟 테이블 내부에 모달 배치: 닫기(onClose)와 새로고침(onRefresh)을 자체 해결! */}
      {isRegModalOpen && (
        <IncidentRegistrationModal 
          onClose={() => setRegModalOpen(false)} 
          onRefresh={fetchIncidents} 
        />
      )}
      
      {selectedTicket && (
        <IncidentDetailModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
          onRefresh={fetchIncidents} 
        />
      )}
    </Box>
  );
}

export default IncidentTable;