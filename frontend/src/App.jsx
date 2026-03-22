import { useState, useEffect } from 'react';
import Login from './components/Auth/Login';

import Dashboard from './components/Dashboard/Dashboard';

// 🌟 분리된 카탈로그와 요청 콘솔 임포트
import ServiceCatalogTable from './components/ServiceCatalog/ServiceCatalogTable';

import ServiceRequestConsole from './components/ServiceRequest/ServiceRequestTable';
import ServiceRequestDetailModal from './components/ServiceRequest/ServiceRequestDetailModal';

import IncidentTable from './components/Incident/IncidentTable';
import CMDBTable from './components/CMDB/CMDBTable';
import CMDBRegistrationModal from './components/CMDB/CMDBRegistrationModal';
import UserTable from './components/System/UserTable';
import CompanyTable from './components/System/CompanyTable';
import CodeTable from './components/System/CodeTable';
import IncidentRegistrationModal from './components/Incident/IncidentRegistrationModal';
import IncidentDetailModal from './components/Incident/IncidentDetailModal';
import ChangeRequestTable from './components/Change/ChangeRequestTable';
import ChangeRequestModal from './components/Change/ChangeRequestModal';
import ChangeDetailModal from './components/Change/ChangeDetailModal';
import SlaPolicyTable from './components/SLM/SlaPolicyTable';
import EventConsole from './components/Event/EventConsole';
import ProblemTable from './components/Problem/ProblemTable';
import ReleaseTable from './components/Release/ReleaseTable';
import { apiFetch } from './utils/api';

import './App.css';

import { 
  Box, Drawer, AppBar, Toolbar, Typography, Divider, 
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
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'; // 🌟 카탈로그용 아이콘 추가

const drawerWidth = 260;

function App() {
  const [currentTab, setCurrentTab] = useState('DASHBOARD'); 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [systemSubTab, setSystemSubTab] = useState('USER');
  
  // 🌟 (삭제) serviceSubTab, catalogs, serviceRequests 상태 제거됨! (하위 컴포넌트가 알아서 함)
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

  // 데이터 갱신을 위해 하위 컴포넌트들을 강제로 다시 그리게 하는 꼼수 대신, 
  // 이제 각 하위 컴포넌트들이 스스로 fetch 함수를 가지므로 App.jsx의 refreshAll 역할이 줄어듭니다.
  const refreshAll = () => {
    if (currentTab === 'DASHBOARD') fetchDashboardData();
    if (currentTab === 'INCIDENT') fetchIncidents(searchType, keyword);
    if (currentTab === 'CHANGE') fetchChanges();
    if (currentTab === 'CMDB') fetchCMDB();
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f4f6f8' }}>
      
      {/* --- 1. 상단 앱 바 (AppBar) --- */}
      <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, backgroundColor: '#ffffff', color: '#1e293b', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#1976d2' }}>
            ITSM Enterprise
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccountCircleIcon color="action" />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {currentUser?.name} ({currentUser?.role})
              </Typography>
            </Box>
            <Button variant="outlined" color="inherit" size="small" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ borderColor: '#e2e8f0' }}>로그아웃</Button>
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
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 1, color: '#60a5fa' }}>ITSM PRO</Typography>
        </Toolbar>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        
        <List sx={{ px: 2, pt: 2 }}>
          {/* 공통 메뉴 */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton selected={currentTab === 'DASHBOARD'} onClick={() => setCurrentTab('DASHBOARD')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
              <ListItemIcon sx={{ color: currentTab === 'DASHBOARD' ? '#60a5fa' : '#94a3b8' }}><DashboardIcon /></ListItemIcon>
              <ListItemText primary="대시보드" primaryTypographyProps={{ fontWeight: currentTab === 'DASHBOARD' ? 'bold' : 'normal' }} />
            </ListItemButton>
          </ListItem>

          {/* 🌟 분리된 카탈로그 탭 (신청) */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton selected={currentTab === 'CATALOG'} onClick={() => setCurrentTab('CATALOG')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
              <ListItemIcon sx={{ color: currentTab === 'CATALOG' ? '#60a5fa' : '#94a3b8' }}><ShoppingCartIcon /></ListItemIcon>
              <ListItemText primary="서비스 카탈로그" primaryTypographyProps={{ fontWeight: currentTab === 'CATALOG' ? 'bold' : 'normal' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton selected={currentTab === 'EVENT'} onClick={() => setCurrentTab('EVENT')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(239, 68, 68, 0.16)' } }}>
              <ListItemIcon sx={{ color: currentTab === 'EVENT' ? '#ef4444' : '#94a3b8' }}><WarningAmberIcon /></ListItemIcon>
              <ListItemText primary="이벤트 관제" primaryTypographyProps={{ fontWeight: currentTab === 'EVENT' ? 'bold' : 'normal', color: currentTab === 'EVENT' ? '#ef4444' : 'inherit' }} />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton selected={currentTab === 'INCIDENT'} onClick={() => setCurrentTab('INCIDENT')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
              <ListItemIcon sx={{ color: currentTab === 'INCIDENT' ? '#60a5fa' : '#94a3b8' }}><BugReportIcon /></ListItemIcon>
              <ListItemText primary="장애 관리" primaryTypographyProps={{ fontWeight: currentTab === 'INCIDENT' ? 'bold' : 'normal' }} />
            </ListItemButton>
          </ListItem>

          {/* AGENT 및 ADMIN 전문 메뉴 */}
          {(userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN') && (
            <>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 2 }} />
              
              {/* 🌟 분리된 서비스 요청 탭 (관제/결재) */}
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
                  <ListItemText primary="자산/CMDB" primaryTypographyProps={{ fontWeight: currentTab === 'CMDB' ? 'bold' : 'normal' }} />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton selected={currentTab === 'SLM'} onClick={() => setCurrentTab('SLM')} sx={{ borderRadius: 2, '&.Mui-selected': { backgroundColor: 'rgba(96, 165, 250, 0.16)' } }}>
                  <ListItemIcon sx={{ color: currentTab === 'SLM' ? '#60a5fa' : '#94a3b8' }}><SpeedIcon /></ListItemIcon>
                  <ListItemText primary="SLM (서비스 수준)" primaryTypographyProps={{ fontWeight: currentTab === 'SLM' ? 'bold' : 'normal' }} />
                </ListItemButton>
              </ListItem>
            </>
          )}

          {/* ADMIN 전용 시스템 메뉴 */}
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
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: `calc(100% - ${drawerWidth}px)`, overflow: 'auto' }}>
        <Toolbar /> 
        
        {currentTab === 'DASHBOARD' && <Dashboard data={dashboardData} />}

        {currentTab === 'EVENT' && <EventConsole />}

        {/* 🌟 1. 독립된 메인 탭: 서비스 카탈로그 (누구나 볼 수 있음) */}
        {currentTab === 'CATALOG' && <ServiceCatalogTable />}

        {/* 🌟 2. 독립된 메인 탭: 서비스 요청 관제 (주로 AGENT, ADMIN용, 필요 시 USER 본인 요청 조회용으로 확장 가능) */}
        {currentTab === 'SERVICE_REQUEST' && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                📋 서비스 요청 관리 (Service Request)
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
                🚨 장애 관리 (Incident Management)
              </Typography>
            </Box>
            <IncidentTable />
          </>
        )}

        {currentTab === 'PROBLEM' && <ProblemTable />}

        {currentTab === 'CHANGE' && (
          <>
            <div className="action-bar" style={{ paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>🚀 변경 관리 (Change Management)</Typography>
              <button className="btn btn-primary" onClick={() => setIsChangeModalOpen(true)}>+ 신규 변경 요청</button>
            </div>
            <ChangeRequestTable data={changes} onRowClick={setSelectedChange} />
            {isChangeModalOpen && <ChangeRequestModal onClose={() => setIsChangeModalOpen(false)} onRefresh={fetchChanges} />}
            {selectedChange && <ChangeDetailModal request={selectedChange} onClose={() => setSelectedChange(null)} onRefresh={fetchChanges} />}
          </>
        )}

        {currentTab === 'RELEASE' && <ReleaseTable />}

        {currentTab === 'CMDB' && (
          <>
            <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>IT 자산 구성 데이터베이스 (CMDB)</Typography>
              <button className="btn btn-primary" onClick={() => setCmdbModalOpen(true)}>+ 신규 CI 등록</button>
            </div>
            <CMDBTable data={cmdbItems} />
          </>
        )}

        {currentTab === 'SLM' && <SlaPolicyTable />}

        {currentTab === 'SYSTEM' && (
          <>
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <button className={`btn ${systemSubTab === 'USER' ? 'btn-outline active' : 'btn-outline'}`} onClick={() => setSystemSubTab('USER')}>사용자 관리</button>
              <button className={`btn ${systemSubTab === 'COMPANY' ? 'btn-outline active' : 'btn-outline'}`} onClick={() => setSystemSubTab('COMPANY')}>고객사 관리</button>
              <button className={`btn ${systemSubTab === 'CODE' ? 'btn-outline active' : 'btn-outline'}`} onClick={() => setSystemSubTab('CODE')}>공통 코드 관리</button>
            </div>
            {systemSubTab === 'USER' && <UserTable />}
            {systemSubTab === 'COMPANY' && <CompanyTable />}
            {systemSubTab === 'CODE' && <CodeTable />}
          </>
        )}
      </Box>

      {/* 모달창들 (화면 위에 덮어씌워짐) */}
      {isRegModalOpen && <IncidentRegistrationModal onClose={() => setRegModalOpen(false)} onRefresh={refreshAll} />}
      {selectedTicket && <IncidentDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onRefresh={refreshAll} />}
      {isCmdbModalOpen && <CMDBRegistrationModal onClose={() => setCmdbModalOpen(false)} onRefresh={refreshAll} />}
    </Box>
  );
}

export default App;