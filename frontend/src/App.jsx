import { useState, useEffect } from 'react';
import Login from './components/Auth/Login';
import { useIncidents } from './hooks/useIncidents';
import Dashboard from './components/Dashboard/Dashboard';
import IncidentTable from './components/Incident/IncidentTable';
import CatalogGrid from './components/Catalog/CatalogGrid';
import ServiceRequestTable from './components/Catalog/ServiceRequestTable';

import CMDBTable from './components/CMDB/CMDBTable'; // 🌟 CMDB 추가
import CMDBRegistrationModal from './components/CMDB/CMDBRegistrationModal'; // 🌟 추가

// 🌟 새로 추가된 시스템 관리 컴포넌트 임포트
import UserTable from './components/System/UserTable';
import CompanyTable from './components/System/CompanyTable';
import CodeTable from './components/System/CodeTable';

import IncidentRegistrationModal from './components/Incident/IncidentRegistrationModal';
import IncidentDetailModal from './components/Incident/IncidentDetailModal';
import ServiceRequestDetailModal from './components/Catalog/ServiceRequestDetailModal';

// 🌟 변경 관리 컴포넌트들 임포트 확인!
import ChangeRequestTable from './components/Change/ChangeRequestTable';
import ChangeRequestModal from './components/Change/ChangeRequestModal';
import ChangeDetailModal from './components/Change/ChangeDetailModal';

import SlaPolicyTable from './components/SLM/SlaPolicyTable';
import EventConsole from './components/Event/EventConsole';
import ProblemTable from './components/Problem/ProblemTable';
import ReleaseTable from './components/Release/ReleaseTable';
import { apiFetch } from './utils/api'; // apiFetch 경로 확인!

import './App.css';

// 🌟 카탈로그용 하드코딩 데이터 (DB가 아직 없으므로 임시로 씁니다)
// TO-DO
const MOCK_CATALOGS = [
  { id: 1, category: 'H/W', name: 'PC/노트북 지급', description: '신규 입사자 및 노후 장비 교체를 위한 PC 요청', estimatedDays: 3 },
  { id: 2, category: 'S/W', name: '소프트웨어 라이선스', description: '업무용 S/W (Adobe, MS Office 등) 설치 요청', estimatedDays: 1 },
  { id: 3, category: '접근권한', name: '시스템 권한/계정', description: '사내 주요 시스템 접근 권한 및 계정 발급', estimatedDays: 2 }
];

function App() {
  const [currentTab, setCurrentTab] = useState('DASHBOARD'); 
  // 🌟 인증 상태 관리
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // 🌟 시스템 관리 하위 탭 상태 (기본값: 사용자 관리)
  const [systemSubTab, setSystemSubTab] = useState('USER');

  const {incidents, fetchIncidents} = useIncidents(isAuthenticated);
  const [searchType, setSearchType] = useState('requester');
  const [keyword, setKeyword] = useState('');
  
  // 🌟 1. 서비스 요청 탭을 위한 4가지 상태 바구니 추가!
  const [serviceSubTab, setServiceSubTab] = useState('CATALOG');
  const [catalogs, setCatalogs] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  // 🌟 변경 관리(Change)를 위한 상태 바구니 추가!
  const [changes, setChanges] = useState([]); 
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [selectedChange, setSelectedChange] = useState(null);
  
  const [cmdbItems, setCmdbItems] = useState([]); // 🌟 CMDB 데이터 상태
  const [isCmdbModalOpen, setCmdbModalOpen] = useState(false); // 🌟 추가
  
  const [isRegModalOpen, setRegModalOpen] = useState(false);
  
  const [selectedTicket, setSelectedTicket] = useState(null);

  const fetchDashboardData = () => fetch('http://localhost:8080/api/dashboard/summary').then(res => res.json()).then(setDashboardData);
  
  // 🌟 2. 서비스 요청 데이터를 불러오는 함수 만들기
  const fetchServiceRequests = () => {
    // 💡 백엔드 API 주소를 확인해주세요! (예: /service-requests 또는 /requests)
    apiFetch('/service-requests') 
      .then(res => res.json())
      .then(data => setServiceRequests(data))
      .catch(err => console.error('서비스 요청 데이터 로드 실패:', err));
  };

  // 🌟 변경 관리 데이터 불러오기 함수
  const fetchChanges = () => {
    // 💡 백엔드 API 주소 확인! (예: /changes 또는 /api/changes)
    console.log("1. 변경 데이터 요청 시작!"); // 호출 여부 확인
    apiFetch('/changes')
      .then(res => {
        if (!res.ok) throw new Error('서버 에러');
        return res.text();
      })
      .then(text => text ? JSON.parse(text) : [])
      .then(data => {
        console.log("2. 백엔드에서 받은 데이터:", data); // 실제 데이터 확인
        setChanges(data);})
      .catch(err => {
        console.error('변경 데이터 로드 실패:', err);
        setChanges([]); // 에러 시 빈 배열
      });
  };

  const fetchCMDB = () => {
    apiFetch('/cmdb')
    .then(res => res.json())
    .then(data => setCmdbItems(data))
    .catch(err => console.error('CMDB 로드 실패:', err));
  };

  // 🌟 현재 로그인한 사람의 권한 확인
  const userRole = currentUser?.role;

  // 화면이 처음 켜질 때 LocalStorage에 토큰이 있는지 검사
  useEffect(() => {
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('userRole');
    if (token) {
      setIsAuthenticated(true);
      setCurrentUser({ name, role });
    }

    // 🌟 3. 서비스 요청 탭이 열리거나, 서브 탭이 바뀔 때마다 데이터 채워주기
    if (currentTab === 'SERVICE_REQUEST') {
      setCatalogs(MOCK_CATALOGS); // 카탈로그 바구니 채우기
      fetchServiceRequests();     // 요청/승인 현황 바구니 채우기
    }

    // 🌟 4. 탭이 열릴 때 데이터 로드
    if (currentTab === 'CHANGE') {
      fetchChanges();
    }

    // 🌟 추가: CMDB 탭을 누르면 데이터를 가져옵니다.
    if (currentTab === 'CMDB') {
      fetchCMDB();
    }
  }, [currentTab, serviceSubTab]);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear(); // 토큰 삭제
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // 🌟 토큰이 없으면 로그인 화면만 렌더링!
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const refreshAll = () => {
    if (currentTab === 'DASHBOARD') fetchDashboardData();
    if (currentTab === 'INCIDENT') fetchIncidents(searchType, keyword);
    if (currentTab === 'SERVICE_REQUEST') fetchServiceRequests();
    if (currentTab === 'CHANGE') fetchChanges();
    if (currentTab === 'CMDB') fetchCMDB();
  };

  return (
    <div className="app-container">
      {/* 🌟 상단 헤더에 사용자 이름과 로그아웃 버튼 추가 */}
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: 0, color: 'var(--primary)' }}>ITSM Enterprise</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 'bold' }}>👤 {currentUser?.name} ({currentUser?.role})</span>
          <button className="btn btn-outline" onClick={handleLogout}>로그아웃</button>
        </div>
      </header>

      {/* 🌟 탭 순서 적용: 대시보드 -> 서비스 -> 장애 -> 변경 -> CMDB */}
      <nav className="main-nav">
        {/* 누구나 볼 수 있는 메뉴 */}
        <button className={`nav-tab ${currentTab === 'DASHBOARD' ? 'active' : ''}`} onClick={() => setCurrentTab('DASHBOARD')}>대시보드</button>
        <button className={`nav-tab ${currentTab === 'EVENT' ? 'active' : ''}`} onClick={() => setCurrentTab('EVENT')} style={{ color: currentTab === 'EVENT' ? '#ef4444' : '#475569', fontWeight: 'bold' }}>🚨 이벤트 관제</button>
        <button className={`nav-tab ${currentTab === 'SERVICE_REQUEST' ? 'active' : ''}`} onClick={() => setCurrentTab('SERVICE_REQUEST')}>서비스 요청</button>
        <button className={`nav-tab ${currentTab === 'INCIDENT' ? 'active' : ''}`} onClick={() => setCurrentTab('INCIDENT')}>장애 관리</button>

        {/* 🌟 AGENT(직원) 또는 ADMIN(관리자)만 볼 수 있는 전문 메뉴 */}
        {(userRole === 'ROLE_AGENT' || userRole === 'ROLE_ADMIN') && (
          <>
            <button className={`nav-tab ${currentTab === 'PROBLEM' ? 'active' : ''}`} onClick={() => setCurrentTab('PROBLEM')}>🧩 문제 관리</button>
            <button className={`nav-tab ${currentTab === 'CHANGE' ? 'active' : ''}`} onClick={() => setCurrentTab('CHANGE')}>변경 관리</button>
            <button className={`nav-tab ${currentTab === 'RELEASE' ? 'active' : ''}`} onClick={() => setCurrentTab('RELEASE')}>🚀 배포 관리</button>
            <button className={`nav-tab ${currentTab === 'CMDB' ? 'active' : ''}`} onClick={() => setCurrentTab('CMDB')}>자산/CMDB</button>
            <button className={`nav-tab ${currentTab === 'SLM' ? 'active' : ''}`} onClick={() => setCurrentTab('SLM')} style={{ color: currentTab === 'SLM' ? 'var(--primary)' : '#475569', fontWeight: 'bold' }}>📊 SLM (서비스 수준)</button>
          </>
        )}

        {/* 🌟 오직 ADMIN(최고 관리자)만 볼 수 있는 시스템 메뉴 */}
        {userRole === 'ROLE_ADMIN' && (
          <button className={`nav-tab ${currentTab === 'SYSTEM' ? 'active' : ''}`} onClick={() => setCurrentTab('SYSTEM')} style={{ marginLeft: 'auto' }}>⚙️ 시스템 관리</button>
        )}
      </nav>

      <main className="content-area">
        {currentTab === 'DASHBOARD' && <Dashboard data={dashboardData} />}

        {/* 🌟 이벤트 관제 컨텐츠 렌더링 */}
        {currentTab === 'EVENT' && (
          <EventConsole />
        )}

        {currentTab === 'SERVICE_REQUEST' && (
          <>
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
              <button className={`btn ${serviceSubTab === 'CATALOG' ? 'btn-outline active' : 'btn-outline'}`} onClick={() => setServiceSubTab('CATALOG')}>서비스 카탈로그</button>
              <button className={`btn ${serviceSubTab === 'MY_REQUESTS' ? 'btn-outline active' : 'btn-outline'}`} onClick={() => setServiceSubTab('MY_REQUESTS')}>요청/승인 현황</button>
            </div>
            {serviceSubTab === 'CATALOG' 
              ? <CatalogGrid items={catalogs} /> 
              : <ServiceRequestTable data={serviceRequests} onRowClick={setSelectedRequest} />
            }

            {/* 🌟 상세 모달창 띄우기 코드 추가! */}
            {selectedRequest && (
              <ServiceRequestDetailModal 
                request={selectedRequest} 
                onClose={() => setSelectedRequest(null)} 
                onRefresh={fetchServiceRequests} 
              />
            )}
          </>
        )}

        {currentTab === 'INCIDENT' && (
          <>
            <div className="action-bar">
              <div className="search-group">
                <select id="search-type" name="searchType" className="form-control" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                  <option value="requester">요청자명</option>
                  <option value="company">고객사명</option>
                </select>
                <input id="search-keyword" name="keyword" type="text" className="form-control" style={{ width: '300px' }} placeholder="검색어 입력..." value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && fetchIncidents(searchType, keyword)} />
                <button className="btn btn-primary" onClick={() => fetchIncidents(searchType, keyword)}>검색</button>
              </div>
              <button className="btn btn-success" onClick={() => setRegModalOpen(true)}>+ 신규 장애 접수</button>
            </div>
            <IncidentTable data={incidents} onRowClick={setSelectedTicket} />
          </>
        )}

        {/* 🌟 문제 관리 컨텐츠 렌더링 */}
        {currentTab === 'PROBLEM' && (
          <ProblemTable />
        )}

        {/* 🌟 5. 변경 관리 탭 렌더링 영역 */}
        {currentTab === 'CHANGE' && (
          <>
            <div className="action-bar" style={{ padding: '1rem', marginBottom: '1rem', borderBottom: '2px solid var(--border-light)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>🚀 변경 관리 (Change Management)</h3>
              <button className="btn btn-primary" onClick={() => setIsChangeModalOpen(true)}>+ 신규 변경 요청</button>
            </div>
            
            {/* 테이블 렌더링 */}
            <ChangeRequestTable data={changes} onRowClick={setSelectedChange} />

            {/* 신규 등록 모달 */}
            {isChangeModalOpen && (
              <ChangeRequestModal 
                onClose={() => setIsChangeModalOpen(false)} 
                onRefresh={fetchChanges} 
              />
            )}

            {/* 상세 조회 및 승인 모달 */}
            {selectedChange && (
              <ChangeDetailModal 
                request={selectedChange} 
                onClose={() => setSelectedChange(null)} 
                onRefresh={fetchChanges} 
              />
            )}
          </>
        )}

        {/* 🌟 배포 관리 컨텐츠 렌더링 */}
        {currentTab === 'RELEASE' && (
          <ReleaseTable />
        )}

        {/* 🌟 5. CMDB 탭 컨텐츠 */}
        {/* --- CMDB 탭 컨텐츠 --- */}
        {currentTab === 'CMDB' && (
          <>
            <div className="action-bar">
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>IT 자산 구성 데이터베이스 (CMDB)</h3>
              {/* 🌟 alert 삭제하고 모달 열기 상태로 변경 */}
              <button className="btn btn-primary" onClick={() => setCmdbModalOpen(true)}>+ 신규 CI 등록</button>
            </div>
            <CMDBTable data={cmdbItems} />
          </>
        )}

        {/* 🌟 2. SLM 탭 컨텐츠 렌더링 */}
        {currentTab === 'SLM' && (
          <SlaPolicyTable />
        )}

        {/* 🌟 시스템 관리 탭 컨텐츠 */}
        {currentTab === 'SYSTEM' && (
          <>
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
              <button className={`btn ${systemSubTab === 'USER' ? 'btn-outline active' : 'btn-outline'}`} onClick={() => setSystemSubTab('USER')}>사용자 관리</button>
              <button className={`btn ${systemSubTab === 'COMPANY' ? 'btn-outline active' : 'btn-outline'}`} onClick={() => setSystemSubTab('COMPANY')}>고객사 관리</button>
              <button className={`btn ${systemSubTab === 'CODE' ? 'btn-outline active' : 'btn-outline'}`} onClick={() => setSystemSubTab('CODE')}>공통 코드 관리</button>
            </div>
            
            {/* 선택된 하위 탭에 따라 컴포넌트 렌더링 */}
            {systemSubTab === 'USER' && <UserTable />}
            {systemSubTab === 'COMPANY' && <CompanyTable />}
            {systemSubTab === 'CODE' && <CodeTable />}
          </>
        )}
      </main>

      {/* 모달 렌더링 영역 */}
      {isRegModalOpen && <IncidentRegistrationModal onClose={() => setRegModalOpen(false)} onRefresh={refreshAll} />}
      {selectedTicket && <IncidentDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onRefresh={refreshAll} />}
      {selectedRequest && <ServiceRequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} onRefresh={refreshAll} />}
      {isChangeModalOpen && <ChangeRequestModal onClose={() => setIsChangeModalOpen(false)} onRefresh={refreshAll} />}
      {selectedChange && <ChangeDetailModal request={selectedChange} onClose={() => setSelectedChange(null)} onRefresh={refreshAll} />}
      {/* 🌟 CMDB 등록 모달 렌더링 */}
      {isCmdbModalOpen && <CMDBRegistrationModal onClose={() => setCmdbModalOpen(false)} onRefresh={refreshAll} />}
    </div>
  );
}

export default App;