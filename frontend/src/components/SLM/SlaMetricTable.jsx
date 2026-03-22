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

function SlaMetricTable() {
  const [metrics, setMetrics] = useState([]);
  const [policies, setPolicies] = useState([]); // 연결할 정책 목록
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0); 
  const [orderBy, setOrderBy] = useState('id'); 
  const [order, setOrder] = useState('desc'); 

  const [searchName, setSearchName] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('CREATE');
  const [formData, setFormData] = useState({ 
    id: null, metricName: '', policyId: '', unit: 'PERCENTAGE', 
    targetValue: 100, actualValue: 0, measurementPeriod: 'MONTHLY' 
  });

  const canEdit = localStorage.getItem('userRole') === 'ROLE_ADMIN' || localStorage.getItem('userRole') === 'ROLE_AGENT';

  const fetchMetrics = () => {
    apiFetch(`/slm/metrics?page=${page}&size=${rowsPerPage}&sort=${orderBy}&dir=${order}&name=${searchName}`)
      .then(res => res.json())
      .then(data => { setMetrics(data.content || []); setTotalElements(data.totalElements || 0); })
      .catch(err => console.error(err));
  };

  // 모달 열 때 정책 목록 미리 가져오기
  const fetchPoliciesForDropdown = () => {
    apiFetch(`/slm/policies?size=100`).then(res => res.json()).then(data => setPolicies(data.content || []));
  };

  useEffect(() => { fetchMetrics(); }, [page, rowsPerPage, orderBy, order, triggerSearch]); 

  const handleOpenCreate = () => {
    fetchPoliciesForDropdown();
    setFormData({ id: null, metricName: '', policyId: '', unit: 'PERCENTAGE', targetValue: 100, actualValue: 0, measurementPeriod: 'MONTHLY' });
    setModalMode('CREATE'); setIsModalOpen(true);
  };

  const handleOpenEdit = (metric) => {
    fetchPoliciesForDropdown();
    setFormData({ ...metric, policyId: metric.policy?.id || '' });
    setModalMode('EDIT'); setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.metricName) return alert('지표명은 필수입니다.');
    const url = modalMode === 'CREATE' ? '/slm/metrics' : `/slm/metrics/${formData.id}`;
    const method = modalMode === 'CREATE' ? 'POST' : 'PUT';

    try {
      const res = await apiFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (res.ok) { setIsModalOpen(false); fetchMetrics(); }
    } catch (error) { console.error(error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 지표를 삭제하시겠습니까?')) return;
    try {
      const res = await apiFetch(`/slm/metrics/${id}`, { method: 'DELETE' });
      if (res.ok) fetchMetrics();
    } catch (error) { console.error(error); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField size="small" label="지표명 검색" value={searchName} onChange={(e) => setSearchName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && setTriggerSearch(prev => prev + 1)} sx={{ width: 300 }} />
        <Button variant="outlined" onClick={() => setTriggerSearch(prev => prev + 1)}>검색</Button>
        <Box sx={{ flexGrow: 1 }} />
        {canEdit && <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={handleOpenCreate}>신규 지표</Button>}
      </Box>

      <Paper sx={{ boxShadow: 'none', border: '1px solid #e2e8f0' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell fontWeight="bold">지표명</TableCell>
                <TableCell fontWeight="bold">연결된 정책</TableCell>
                <TableCell fontWeight="bold">목표치</TableCell>
                <TableCell fontWeight="bold">현재 측정치 (Actual)</TableCell>
                <TableCell fontWeight="bold">측정 주기</TableCell>
                <TableCell fontWeight="bold">최근 측정일시</TableCell>
                {canEdit && <TableCell align="center" fontWeight="bold">관리</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.map((m) => (
                <TableRow key={m.id} hover>
                  <TableCell sx={{ fontWeight: 'bold' }}>{m.metricName}</TableCell>
                  <TableCell>{m.policy?.policyName || '-'}</TableCell>
                  <TableCell>{m.targetValue} {m.unit === 'PERCENTAGE' ? '%' : m.unit}</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${m.actualValue} ${m.unit === 'PERCENTAGE' ? '%' : m.unit}`} 
                      color={m.unit === 'PERCENTAGE' && m.actualValue >= m.targetValue ? 'success' : 'error'} 
                      sx={{ fontWeight: 'bold' }} 
                    />
                  </TableCell>
                  <TableCell>{m.measurementPeriod}</TableCell>
                  <TableCell>{m.lastMeasuredAt ? m.lastMeasuredAt.replace('T', ' ').substring(0, 16) : '-'}</TableCell>
                  {canEdit && (
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => handleOpenEdit(m)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(m.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={totalElements} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[5, 10]} />
      </Paper>

      {/* 등록/수정 모달 */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 'bold' }}>{modalMode === 'CREATE' ? '신규 측정 지표 등록' : '측정 지표 수정'}</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <TextField label="지표명 (예: 월간 장애 해결 준수율)" value={formData.metricName} onChange={(e) => setFormData({...formData, metricName: e.target.value})} fullWidth required />
          <FormControl fullWidth>
            <InputLabel>연결할 SLA 정책</InputLabel>
            <Select value={formData.policyId} onChange={(e) => setFormData({...formData, policyId: e.target.value})} label="연결할 SLA 정책">
              <MenuItem value=""><em>-- 정책 선택 안함 --</em></MenuItem>
              {policies.map(p => <MenuItem key={p.id} value={p.id}>{p.policyName} ({p.targetType})</MenuItem>)}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>측정 단위</InputLabel>
              <Select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} label="측정 단위">
                <MenuItem value="PERCENTAGE">비율 (%)</MenuItem>
                <MenuItem value="HOURS">시간 (Hours)</MenuItem>
                <MenuItem value="DAYS">일 (Days)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>측정 주기</InputLabel>
              <Select value={formData.measurementPeriod} onChange={(e) => setFormData({...formData, measurementPeriod: e.target.value})} label="측정 주기">
                <MenuItem value="MONTHLY">월간 (MONTHLY)</MenuItem>
                <MenuItem value="WEEKLY">주간 (WEEKLY)</MenuItem>
                <MenuItem value="DAILY">일간 (DAILY)</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="목표치 (Target)" type="number" value={formData.targetValue} onChange={(e) => setFormData({...formData, targetValue: e.target.value})} fullWidth />
            <TextField label="현재 측정치 (Actual)" type="number" value={formData.actualValue} onChange={(e) => setFormData({...formData, actualValue: e.target.value})} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsModalOpen(false)}>취소</Button>
          <Button onClick={handleSubmit} variant="contained" color="secondary">저장</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SlaMetricTable;