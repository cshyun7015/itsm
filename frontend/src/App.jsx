import { useState, useEffect } from 'react';
import { apiFetch } from './utils/api';

import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';

// 🌟 분리된 카탈로그와 요청 콘솔 임포트
import ServiceCatalogTable from './components/ServiceCatalog/ServiceCatalogTable';
import ServiceRequestConsole from './components/ServiceRequest/ServiceRequestTable';
import ServiceRequestDetailModal from './components/ServiceRequest/ServiceRequestDetailModal';

import IncidentTable from './components/Incident/IncidentTable';
import CMDBTable from './components/CMDB/CMDBTable';

import IncidentRegistrationModal from './components/Incident/IncidentRegistrationModal';
import IncidentDetailModal from './components/Incident/IncidentDetailModal';

import ChangeRequestTable from './components/Change/ChangeRequestTable';
import SlmManagement from './components/SLM/SlmManagement';

import EventConsole from './components/Event/EventConsole';
import ProblemTable from './components/Problem/ProblemTable';
import ReleaseTable from './components/Release/ReleaseTable';
import SystemManagement from './components/System/SystemManagement';

import './App.css';
import logo from './assets/logo.png';

import { 
  Box, Drawer, AppBar, Toolbar, Typography, Divider, ThemeProvider, createTheme, CssBaseline,
  List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button 
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BugReportIcon from '@mui/icons-material/BugReport';
import ExtensionIcon from '@mui/icons-material/Extension';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StorageIcon from '@mui/icons-material/Storage';
import SpeedIcon from '@mui/icons-material/Speed';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const drawerWidth = 260;

// 🌟 넥서스 전용 다크 테마 생성
const nexusDarkTheme = createTheme({
  palette: {
    mode: 'dark', // 다크 모드 활성화!
    background: {
      default: '#0f172a', // 앱 전체 기본 배경
      paper: '#1e293b',   // 카드, 모달, 사이드바 배경
    },
    primary: {
      main: '#3b82f6',    // 넥서스 메인 블루 포인트 컬러
    },
    text: {
      primary: '#f8fafc', // 기본 글자색 (흰색에 가까운 회색)
      secondary: '#94a3b8', // 보조 글자색 (조금 더 어두운 회색)
    },
    divider: '#334155',   // 구분선 색상
  },
  typography: {
    fontFamily: "'Pretendard', 'Roboto', 'Arial', sans-serif",
  },
  components: {
    // 🌟 스크롤바 다크 테마 전역 적용
    MuiCssBaseline: {
      styleOverrides: `
        /* Firefox 지원 */
        * {
          scrollbar-width: thin;
          scrollbar-color: #334155 #0f172a;
        }
        
        /* WebKit 브라우저 (Chrome, Edge, Safari) 지원 */
        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #0f172a; /* 스크롤바 뒷 배경 */
        }
        ::-webkit-scrollbar-thumb {
          background: #334155; /* 스크롤 막대 색상 */
          border-radius: 8px;
          border: 2px solid #0f172a; /* 막대 테두리 슬림화 */
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569; /* 마우스 오버 시 색상 */
        }
      `,
    },
    // 버튼 등 기본 컴포넌트 둥글기 일괄 적용
    MuiButton: { styleOverrides: { root: { borderRadius: '8px', textTransform: 'none' } } },
    MuiCard: { styleOverrides: { root: { borderRadius: '12px', backgroundImage: 'none' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }, 
  }
});

function App() {
  const [currentTab, setCurrentTab] = useState('DASHBOARD'); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [systemSubTab, setSystemSubTab] = useState('USER');
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const [changes, setChanges] = useState([]); 
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [selectedChange, setSelectedChange] = useState(null);
  const [cmdbItems, setCmdbItems] = useState([]); 
  const [isCmdbModalOpen, setCmdbModalOpen] = useState(false); 
  const [isRegModalOpen, setRegModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchDashboardData = () => fetch('http://localhost:8080/api/dashboard/summary').then(res => res.json()).then(setDashboardData);

  const fetchChanges = () => {
    apiFetch('/changes')
      .then(res => {
        if (!res.ok) throw new Error('서버 에러');
        return res.text();
      })
      .then(text => text ? JSON.parse(text) : [])
      .then(data => setChanges(data))
      .catch(err => {
        console.error('변경 데이터 로드 실패:', err);
        setChanges([]);
      });
  };

  const fetchCMDB = () => {
    apiFetch('/cmdb')
    .then(res => res.json())
    .then(data => setCmdbItems(data))
    .catch(err => console.error('CMDB 로드 실패:', err));
  };

  const userRole = currentUser?.role;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    if (token) {
      setIsAuthenticated(true);
      setCurrentUser({ name, role });
    }

    if (currentTab === 'CHANGE') fetchChanges();
    if (currentTab === 'CMDB') fetchCMDB();
  }, [currentTab]);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear(); 
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const refreshAll = () => {
    if (currentTab === 'DASHBOARD') fetchDashboardData();
    if (currentTab === 'INCIDENT') fetchIncidents(searchType, keyword); // 주의: App.jsx 레벨에 해당 함수가 정의되어 있지 않다면 하위 컴포넌트에서 호출되도록 해야합니다.
    if (currentTab === 'CHANGE') fetchChanges();
    if (currentTab === 'CMDB') fetchCMDB();
  };

  return (
    // 🌟 ThemeProvider와 CssBaseline을 최상단에 적용
    <ThemeProvider theme={nexusDarkTheme}>
      <CssBaseline />
      
      {/* 🌟 전체 레이아웃 래퍼 배경색도 다크 테마로 변경 */}
      <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a' }}>
        
        {/* --- 1. 상단 앱 바 (AppBar) --- */}
        <AppBar 
          position="fixed" 
          sx={{ 
            width: `calc(100% - ${drawerWidth}px)`, 
            ml: `${drawerWidth}px`, 
            backgroundColor: '#1e293b', // 다크 테마 카드 배경색
            color: '#f8fafc',           // 밝은 글자색
            boxShadow: 'none',          
            borderBottom: '1px solid #334155' // 하단 테두리 선 추가
          }}
        >
          <Toolbar>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: '900', color: '#f8fafc', letterSpacing: '-0.5px' }}>
              ITSM v4 (<span style={{ color: '#3b82f6' }}>NEXUS</span>)
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccountCircleIcon sx={{ color: '#94a3b8' }} /> 
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>
                  {currentUser?.name} ({currentUser?.role})
                </Typography>
              </Box>
              
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<LogoutIcon />} 
                onClick={handleLogout} 
                sx={{ 
                  color: '#94a3b8', 
                  borderColor: '#475569', 
                  '&:hover': { 
                    borderColor: '#f8fafc', 
                    color: '#f8fafc', 
                    backgroundColor: 'rgba(255,255,255,0.05)' 
                  } 
                }}
              >
                로그아웃
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* --- 2. 좌측 사이드바 (Drawer) --- */}
        <Drawer
          sx={{
            width: drawerWidth, flexShrink: 0,
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', backgroundColor: '#1e293b', color: '#f8fafc' },
          }}
          variant="permanent" anchor="left"
        >
          <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
            <img 
              src={logo} 
              alt="ITSM PRO Logo" 
              style={{ height: '50px', width: 'auto' }} // 로고 크기 조정 필요 시 수정
            />
          </Toolbar>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
          
          <List sx={{ px: 2, pt: 2 }}>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton selected={currentTab === 'DASHBOARD'} onClick={() => setCurrentTab('DASHBOARD')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
                <ListItemIcon sx={{ color: currentTab === 'DASHBOARD' ? '#60a5fa' : '#94a3b8' }}><DashboardIcon /></ListItemIcon>
                <ListItemText primary="대시보드" primaryTypographyProps={{ fontWeight: currentTab === 'DASHBOARD' ? 'bold' : 'normal' }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton selected={currentTab === 'CATALOG'} onClick={() => setCurrentTab('CATALOG')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
                <ListItemIcon sx={{ color: currentTab === 'CATALOG' ? '#60a5fa' : '#94a3b8' }}><ShoppingCartIcon /></ListItemIcon>
                <ListItemText primary="서비스 카탈로그" primaryTypographyProps={{ fontWeight: currentTab === 'CATALOG' ? 'bold' : 'normal' }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton selected={currentTab === 'EVENT'} onClick={() => setCurrentTab('EVENT')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(239, 68, 68, 0.16)' } }}>
                <ListItemIcon sx={{ color: currentTab === 'EVENT' ? '#ef4444' : '#94a3b8' }}><WarningAmberIcon /></ListItemIcon>
                <ListItemText primary="이벤트 관리" primaryTypographyProps={{ fontWeight: currentTab === 'EVENT' ? 'bold' : 'normal', color: currentTab === 'EVENT' ? '#ef4444' : 'inherit' }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding sx={{ mb: 1 }}>
              <ListItemButton selected={currentTab === 'INCIDENT'} onClick={() => setCurrentTab('INCIDENT')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
                <ListItemIcon sx={{ color: currentTab === 'INCIDENT' ? '#60a5fa' : '#94a3b8' }}><BugReportIcon /></ListItemIcon>
                <ListItemText primary="장애 관리" primaryTypographyProps={{ fontWeight: currentTab === 'INCIDENT' ? 'bold' : 'normal' }} />
              </ListItemButton>
            </ListItem>

            {(userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN') && (
              <>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton selected={currentTab === 'SERVICE_REQUEST'} onClick={() => setCurrentTab('SERVICE_REQUEST')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
                    <ListItemIcon sx={{ color: currentTab === 'SERVICE_REQUEST' ? '#60a5fa' : '#94a3b8' }}><AssignmentIcon /></ListItemIcon>
                    <ListItemText primary="서비스 요청 관리" primaryTypographyProps={{ fontWeight: currentTab === 'SERVICE_REQUEST' ? 'bold' : 'normal' }} />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton selected={currentTab === 'PROBLEM'} onClick={() => setCurrentTab('PROBLEM')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
                    <ListItemIcon sx={{ color: currentTab === 'PROBLEM' ? '#60a5fa' : '#94a3b8' }}><ExtensionIcon /></ListItemIcon>
                    <ListItemText primary="문제 관리" primaryTypographyProps={{ fontWeight: currentTab === 'PROBLEM' ? 'bold' : 'normal' }} />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton selected={currentTab === 'CHANGE'} onClick={() => setCurrentTab('CHANGE')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
                    <ListItemIcon sx={{ color: currentTab === 'CHANGE' ? '#60a5fa' : '#94a3b8' }}><ChangeCircleIcon /></ListItemIcon>
                    <ListItemText primary="변경 관리" primaryTypographyProps={{ fontWeight: currentTab === 'CHANGE' ? 'bold' : 'normal' }} />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton selected={currentTab === 'RELEASE'} onClick={() => setCurrentTab('RELEASE')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
                    <ListItemIcon sx={{ color: currentTab === 'RELEASE' ? '#60a5fa' : '#94a3b8' }}><RocketLaunchIcon /></ListItemIcon>
                    <ListItemText primary="배포 관리" primaryTypographyProps={{ fontWeight: currentTab === 'RELEASE' ? 'bold' : 'normal' }} />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton selected={currentTab === 'CMDB'} onClick={() => setCurrentTab('CMDB')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
                    <ListItemIcon sx={{ color: currentTab === 'CMDB' ? '#60a5fa' : '#94a3b8' }}><StorageIcon /></ListItemIcon>
                    <ListItemText primary="구성 관리" primaryTypographyProps={{ fontWeight: currentTab === 'CMDB' ? 'bold' : 'normal' }} />
                  </ListItemButton>
                </ListItem>

                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton selected={currentTab === 'SLM'} onClick={() => setCurrentTab('SLM')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
                    <ListItemIcon sx={{ color: currentTab === 'SLM' ? '#60a5fa' : '#94a3b8' }}><SpeedIcon /></ListItemIcon>
                    <ListItemText primary="서비스 수준 관리" primaryTypographyProps={{ fontWeight: currentTab === 'SLM' ? 'bold' : 'normal' }} />
                  </ListItemButton>
                </ListItem>
              </>
            )}

            {userRole === 'ROLE_ADMIN' && (
              <>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton selected={currentTab === 'SYSTEM'} onClick={() => setCurrentTab('SYSTEM')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
                    <ListItemIcon sx={{ color: currentTab === 'SYSTEM' ? '#60a5fa' : '#94a3b8' }}><SettingsIcon /></ListItemIcon>
                    <ListItemText primary="시스템 관리" primaryTypographyProps={{ fontWeight: currentTab === 'SYSTEM' ? 'bold' : 'normal' }} />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Drawer>

        {/* --- 3. 메인 콘텐츠 영역 --- */}
        <Box 
          component="main" 
          sx={{ 
              flexGrow: 1, 
              p: 3, 
              width: `calc(100% - ${drawerWidth}px)`, 
              overflow: 'auto',
              backgroundColor: '#0f172a', // 다크 테마 깊은 배경색
              minHeight: '100vh',         // 빈 내용물에도 화면 꽉 채우기
              color: '#f8fafc'            // 텍스트 밝게 설정
          }}>
          <Toolbar /> 
          
          {currentTab === 'DASHBOARD' && <Dashboard data={dashboardData} />}
          {currentTab === 'EVENT' && <EventConsole />}
          {currentTab === 'CATALOG' && <ServiceCatalogTable />}

          {currentTab === 'SERVICE_REQUEST' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  📋 서비스 요청 (Service Request) 목록
                </Typography>
              </Box>
              <ServiceRequestConsole onRowClick={setSelectedRequest} />
              {selectedRequest && (
                <ServiceRequestDetailModal 
                  request={selectedRequest} 
                  onClose={() => setSelectedRequest(null)} 
                  onRefresh={refreshAll} 
                />
              )}
            </>
          )}

          {currentTab === 'INCIDENT' && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                  🚨 장애 (Incident) 목록
                </Typography>
              </Box>
              <IncidentTable />
            </>
          )}

          {currentTab === 'PROBLEM' && <ProblemTable />}
          {currentTab === 'CHANGE' && <ChangeRequestTable />} 
          {currentTab === 'RELEASE' && <ReleaseTable />}
          {currentTab === 'CMDB' && <CMDBTable />}
          {currentTab === 'SLM' && <SlmManagement />}
          {currentTab === 'SYSTEM' && <SystemManagement />}
        </Box>

        {/* 모달창들 (화면 위에 덮어씌워짐) */}
        {isRegModalOpen && <IncidentRegistrationModal onClose={() => setRegModalOpen(false)} onRefresh={refreshAll} />}
        {selectedTicket && <IncidentDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onRefresh={refreshAll} />}
        {/* 만약 CMDBRegistrationModal 컴포넌트가 있다면 주석을 해제하세요 */}
        {/* {isCmdbModalOpen && <CMDBRegistrationModal onClose={() => setCmdbModalOpen(false)} onRefresh={refreshAll} />} */}
      </Box>
    </ThemeProvider>
  );
}

export default App;