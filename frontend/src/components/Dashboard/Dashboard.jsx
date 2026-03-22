import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Chip, Table, TableBody, TableCell, TableHead, TableRow, TableContainer } from '@mui/material';
import { apiFetch } from '../../utils/api';
import SummaryCards from './SummaryCards';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MemoryIcon from '@mui/icons-material/Memory';
import SpeedIcon from '@mui/icons-material/Speed';

const Dashboard = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // 실시간 모니터링 상태
  const [responseTime, setResponseTime] = useState(null);
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);
  
  const THRESHOLD_MB = 400; // 메모리 경고 임계치

  useEffect(() => {
    // 🌟 단일 통합 API 호출로 요약, 차트, 최근 이슈까지 모두 가져옵니다!
    apiFetch('/dashboard/summary')
      .then(res => res.json())
      .then(setDashboardData)
      .catch(err => console.error('대시보드 로드 실패:', err));
  }, []);

  const handleGenerateData = () => {
    if(!window.confirm('가짜 샘플 데이터를 생성하시겠습니까? (기존 데이터 유지)')) return;
    setIsGenerating(true);
    apiFetch('/dummy/generate', { method: 'POST' })
      .then(res => res.text())
      .then(msg => {
        alert("샘플 데이터 생성이 완료되었습니다!");
        window.location.reload(); 
      })
      .catch(err => alert('오류 발생! 백엔드 콘솔을 확인하세요.'))
      .finally(() => setIsGenerating(false));
  };

  // 🌟 차트 데이터 파싱 로직
  const parsePieData = (mapData) => {
    if (!mapData) return [];
    const colors = { 'OPEN': '#ef4444', 'IN_PROGRESS': '#3b82f6', 'RESOLVED': '#10b981', 'CLOSED': '#64748b' };
    return Object.entries(mapData).map(([key, value]) => ({
      name: key, value, color: colors[key] || '#8b5cf6'
    }));
  };

  const parseBarData = (mapData) => {
    if (!mapData) return [];
    return Object.entries(mapData).map(([key, value]) => ({ name: key, count: value }));
  };

  const pieData = parsePieData(dashboardData?.incidentsByStatus);
  const barData = parseBarData(dashboardData?.incidentsByPriority);

  // --- 기존 실시간 모니터링 로직 유지 (다크테마용 스타일만 변경) ---
  const checkServerCapacity = () => {
    fetch('http://localhost:8080/actuator/metrics/jvm.memory.used').then(res => res.json())
      .then(data => setMemoryUsage((data.measurements[0].value / (1024 * 1024)).toFixed(2)))
      .catch(err => console.error(err));
  };

  const checkServerPerformance = () => {
    fetch('http://localhost:8080/actuator/metrics/http.server.requests').then(res => res.json())
      .then(data => {
        const count = data.measurements.find(m => m.statistic === 'COUNT')?.value || 0;
        const totalTime = data.measurements.find(m => m.statistic === 'TOTAL_TIME')?.value || 0;
        if (count > 0) setResponseTime(((totalTime / count) * 1000).toFixed(2));
      }).catch(err => console.error(err));
  };

  const checkServerAvailability = () => {
    fetch('http://localhost:8080/actuator/health')
      .then(res => { if(!res.ok) throw new Error(); return res.json(); })
      .then(data => setServerStatus(data.status))
      .catch(() => setServerStatus('DOWN'));
  };

  if (!dashboardData) return <Box sx={{ color: 'white', p: 3 }}>데이터를 불러오는 중입니다...</Box>;

  return (
    <Box sx={{ 
      backgroundColor: '#0f172a', // 🌟 다크 테마 메인 배경 (Slate 900)
      minHeight: '100vh', 
      padding: '2rem', 
      borderRadius: '12px',
      color: '#f8fafc' 
    }}>
      {/* 헤더 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: '900', letterSpacing: '-0.5px' }}>
          ITSM 엔터프라이즈 대시보드
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AutoAwesomeIcon />} 
          onClick={handleGenerateData} disabled={isGenerating}
          sx={{ bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' }, fontWeight: 'bold' }}
        >
          {isGenerating ? '생성 중...' : '샘플 데이터 100개 생성'}
        </Button>
      </Box>
      
      {/* 요약 카드 */}
      <SummaryCards data={dashboardData.summary} />

      {/* 🌟 메인 컨텐츠 영역 (차트 & 테이블) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr 1.5fr' }, gap: 3, mb: 4 }}>
        
        {/* 도넛 차트 (상태별 분포) */}
        <Paper sx={{ bgcolor: '#1e293b', p: 3, borderRadius: '12px', boxShadow: 3 }}>
          <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 2 }}>상태별 티켓 분포 (Status)</Typography>
          <Box sx={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '0.9rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* 바 차트 (우선순위별 분포) */}
        <Paper sx={{ bgcolor: '#1e293b', p: 3, borderRadius: '12px', boxShadow: 3 }}>
          <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 2 }}>우선순위별 티켓 (Priority)</Typography>
          <Box sx={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#334155' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* 최근 발생 티켓 목록 */}
        <Paper sx={{ bgcolor: '#1e293b', p: 3, borderRadius: '12px', boxShadow: 3, overflow: 'hidden' }}>
          <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 2 }}>최근 발생한 이슈 (Recent Incidents)</Typography>
          <TableContainer sx={{ maxHeight: 250 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155', fontWeight: 'bold' }}>ID</TableCell>
                  <TableCell sx={{ bgcolor: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155', fontWeight: 'bold' }}>제목</TableCell>
                  <TableCell sx={{ bgcolor: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155', fontWeight: 'bold' }}>상태</TableCell>
                  <TableCell sx={{ bgcolor: '#1e293b', color: '#94a3b8', borderBottom: '1px solid #334155', fontWeight: 'bold' }}>일시</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboardData.recentIncidents.map(inc => (
                  <TableRow key={inc.id} sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell sx={{ color: '#3b82f6', borderBottom: '1px solid #334155' }}>#{inc.id}</TableCell>
                    <TableCell sx={{ color: '#f8fafc', borderBottom: '1px solid #334155', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inc.title}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #334155' }}>
                      <Chip label={inc.status} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold', bgcolor: inc.status === 'OPEN' ? '#7f1d1d' : '#064e3b', color: inc.status === 'OPEN' ? '#fca5a5' : '#6ee7b7' }} />
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', borderBottom: '1px solid #334155', fontSize: '0.8rem' }}>{inc.createdAt.split('T')[0]}</TableCell>
                  </TableRow>
                ))}
                {dashboardData.recentIncidents.length === 0 && (
                  <TableRow><TableCell colSpan={4} sx={{ color: '#94a3b8', textAlign: 'center', py: 3, border: 0 }}>데이터가 없습니다.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      </Box>

      {/* 🌟 실시간 모니터링 (가용성/성능/용량) 영역 */}
      <Typography variant="h6" sx={{ color: '#f8fafc', fontWeight: 'bold', mb: 2 }}>실시간 인프라 모니터링 (Actuator)</Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3 }}>
        
        {/* 가용성 체크 */}
        <Paper sx={{ bgcolor: serverStatus === 'DOWN' ? '#450a0a' : '#1e293b', p: 3, borderRadius: '12px', border: `1px solid ${serverStatus === 'DOWN' ? '#ef4444' : '#334155'}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MonitorHeartIcon sx={{ color: '#10b981' }} />
            <Typography sx={{ fontWeight: 'bold', color: '#fff' }}>가용성 (Health Check)</Typography>
          </Box>
          <Button variant="outlined" size="small" onClick={checkServerAvailability} sx={{ color: '#fff', borderColor: '#475569', mb: 2, '&:hover':{borderColor:'#94a3b8'} }}>체크 실행</Button>
          {serverStatus && (
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: serverStatus === 'UP' ? '#34d399' : '#f87171' }}>
              {serverStatus === 'UP' ? '🟢 서버 정상 구동 중' : '🔴 서버 장애 발생!'}
            </Typography>
          )}
        </Paper>

        {/* 성능 체크 */}
        <Paper sx={{ bgcolor: (responseTime && responseTime > 500) ? '#451a03' : '#1e293b', p: 3, borderRadius: '12px', border: `1px solid ${(responseTime && responseTime > 500) ? '#f59e0b' : '#334155'}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <SpeedIcon sx={{ color: '#3b82f6' }} />
            <Typography sx={{ fontWeight: 'bold', color: '#fff' }}>성능 (Avg Latency)</Typography>
          </Box>
          <Button variant="outlined" size="small" onClick={checkServerPerformance} sx={{ color: '#fff', borderColor: '#475569', mb: 2, '&:hover':{borderColor:'#94a3b8'} }}>응답 속도 측정</Button>
          {responseTime && (
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: responseTime > 500 ? '#fbbf24' : '#60a5fa' }}>
              {responseTime} ms <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>(기준: 500ms)</span>
            </Typography>
          )}
        </Paper>

        {/* 용량 체크 */}
        <Paper sx={{ bgcolor: (memoryUsage && memoryUsage > THRESHOLD_MB) ? '#450a0a' : '#1e293b', p: 3, borderRadius: '12px', border: `1px solid ${(memoryUsage && memoryUsage > THRESHOLD_MB) ? '#ef4444' : '#334155'}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <MemoryIcon sx={{ color: '#8b5cf6' }} />
            <Typography sx={{ fontWeight: 'bold', color: '#fff' }}>용량 (JVM Memory)</Typography>
          </Box>
          <Button variant="outlined" size="small" onClick={checkServerCapacity} sx={{ color: '#fff', borderColor: '#475569', mb: 2, '&:hover':{borderColor:'#94a3b8'} }}>메모리 사용량 측정</Button>
          {memoryUsage && (
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: memoryUsage > THRESHOLD_MB ? '#f87171' : '#a78bfa' }}>
              {memoryUsage} MB <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>(임계치: {THRESHOLD_MB}MB)</span>
            </Typography>
          )}
        </Paper>

      </Box>
    </Box>
  );
};

export default Dashboard;