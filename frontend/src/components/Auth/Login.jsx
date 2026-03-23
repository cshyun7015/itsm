import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, InputAdornment } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import HexagonIcon from '@mui/icons-material/Hexagon'; // 넥서스 로고 대용

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Login.jsx 내의 handleLogin 함수 수정
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const data = await response.json();
        
        // 🌟 범인 색출용 로그 출력! (F12 콘솔창에서 확인 필수)
        console.log("백엔드에서 받은 데이터:", data);

        if (!data.token) {
          alert("서버에서 토큰을 주지 않았습니다! 백엔드 AuthService.java를 확인하세요.");
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.username); // 프론트는 username인데, 백엔드가 name을 줄 수도 있습니다.
        localStorage.setItem('companyCode', data.companyCode);
        
        console.log("로컬 스토리지 저장 완료! 현재 토큰:", localStorage.getItem('token'));
        
        onLoginSuccess(data); 
      } else {
        setError('아이디 또는 비밀번호가 틀렸습니다.');
      }
    } catch (err) {
      setError('서버에 연결할 수 없습니다.');
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center', 
      // 🌟 고급스러운 다크 그라데이션 배경
      background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
    }}>
      <Paper elevation={24} sx={{ 
        p: 5, 
        width: '100%', 
        maxWidth: '420px', 
        bgcolor: 'rgba(30, 41, 59, 0.8)', // 반투명 다크 배경 (#1e293b)
        backdropFilter: 'blur(10px)',
        borderRadius: '20px', 
        border: '1px solid #334155', // 테두리 라인
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* 로고 및 타이틀 영역 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <HexagonIcon sx={{ fontSize: '3.5rem', color: '#3b82f6', mb: 1 }} />
          <Typography variant="h4" fontWeight="900" sx={{ color: '#f8fafc', letterSpacing: '-1px' }}>
            NEXUS <span style={{ color: '#3b82f6' }}>ITSM</span>
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
            Enterprise IT Service Management
          </Typography>
        </Box>

        {/* 에러 메시지 */}
        {error && (
          <Box sx={{ 
            bgcolor: 'rgba(239, 68, 68, 0.1)', 
            color: '#fca5a5', 
            p: 1.5, 
            borderRadius: '8px', 
            mb: 3, 
            textAlign: 'center', 
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}>
            {error}
          </Box>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <TextField 
            fullWidth
            placeholder="아이디 (예: admin, agent, user)"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: '#64748b' }} />
                </InputAdornment>
              ),
              sx: { 
                color: '#f8fafc', 
                bgcolor: '#0f172a', // 입력창 배경
                borderRadius: '10px',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#475569' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />

          <TextField 
            fullWidth
            type="password"
            placeholder="비밀번호 (기본: 1234)"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: '#64748b' }} />
                </InputAdornment>
              ),
              sx: { 
                color: '#f8fafc', 
                bgcolor: '#0f172a',
                borderRadius: '10px',
                '& fieldset': { borderColor: '#334155' },
                '&:hover fieldset': { borderColor: '#475569' },
                '&.Mui-focused fieldset': { borderColor: '#3b82f6' }
              }
            }}
          />

          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            disabled={isLoading}
            endIcon={<LoginIcon />}
            sx={{ 
              mt: 2, 
              p: 1.8, 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              borderRadius: '10px',
              bgcolor: '#3b82f6',
              '&:hover': { bgcolor: '#2563eb' },
              textTransform: 'none'
            }}
          >
            {isLoading ? '로그인 중...' : '시스템 접속'}
          </Button>
        </form>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: '#64748b', mt: 4 }}>
          © 2026 NEXUS ITSM. All rights reserved.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;