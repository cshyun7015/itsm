import { useState, useEffect } from 'react';
import { useIncidents } from './hooks/useIncidents';
import Dashboard from './components/Dashboard/Dashboard';
import IncidentTable from './components/Incident/IncidentTable';
import CatalogGrid from './components/Catalog/CatalogGrid';
import ServiceRequestTable from './components/Catalog/ServiceRequestTable';
import ChangeRequestTable from './components/Change/ChangeRequestTable';
import CMDBTable from './components/CMDB/CMDBTable'; // 🌟 CMDB 추가
import CMDBRegistrationModal from './components/CMDB/CMDBRegistrationModal'; // 🌟 추가
// 🌟 새로 추가된 시스템 관리 컴포넌트 임포트
import UserTable from './components/System/UserTable';
import CompanyTable from './components/System/CompanyTable';
import CodeTable from './components/System/CodeTable';

import IncidentRegistrationModal from './components/Incident/IncidentRegistrationModal';
import IncidentDetailModal from './components/Incident/IncidentDetailModal';
import ServiceRequestDetailModal from './components/Catalog/ServiceRequestDetailModal';
import ChangeRequestModal from './components/Change/ChangeRequestModal';
import ChangeDetailModal from './components/Change/ChangeDetailModal';

import SlaPolicyTable from './components/SLM/SlaPolicyTable';
import EventConsole from './components/Event/EventConsole';

import './App.css';

function App() {
  const [currentTab, setCurrentTab] = useState('DASHBOARD'); 
  const [serviceSubTab, setServiceSubTab] = useState('CATALOG');
  const [dashboardData, setDashboardData] = useState(null);

  // 🌟 시스템 관리 하위 탭 상태 (기본값: 사용자 관리)
  const [systemSubTab, setSystemSubTab] = useState('USER');

  const { incidents, fetchIncidents } = useIncidents();
  const [searchType, setSearchType] = useState('requester');
  const [keyword, setKeyword] = useState('');
  
  const [catalogs, setCatalogs] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [cmdbItems, setCmdbItems] = useState([]); // 🌟 CMDB 데이터 상태
  const [isCmdbModalOpen, setCmdbModalOpen] = useState(false); // 🌟 추가
  
  const [isRegModalOpen, setRegModalOpen] = useState(false);
  const [isChangeModalOpen, setChangeModalOpen] = useState(false); 
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedChange, setSelectedChange] = useState(null); 

  const fetchDashboardData = () => fetch('http://localhost:8080/api/dashboard/summary').then(res => res.json()).then(setDashboardData);
  const fetchServiceRequests = () => fetch('http://localhost:8080/api/service-requests').then(res => res.json()).then(setServiceRequests);
  const fetchChanges = () => fetch('http://localhost:8080/api/changes').then(res => res.json()).then(setChangeRequests);
  const fetchCMDB = () => fetch('http://localhost:8080/api/cmdb').then(res => res.json()).then(setCmdbItems); // 🌟 CMDB 페치 함수

  useEffect(() => {
    if (currentTab === 'DASHBOARD') fetchDashboardData();
    else if (currentTab === 'SERVICE_REQUEST') {
      serviceSubTab === 'CATALOG' ? fetch('http://localhost:8080/api/catalogs').then(res => res.json()).then(setCatalogs) : fetchServiceRequests();
    } 
    else if (currentTab === 'INCIDENT') fetchIncidents(searchType, keyword);
    else if (currentTab === 'CHANGE') fetchChanges();
    else if (currentTab === 'CMDB') fetchCMDB(); // 🌟 CMDB 탭 클릭 시 데이터 로드
  }, [currentTab, serviceSubTab]);

  const refreshAll = () => {
    if (currentTab === 'DASHBOARD') fetchDashboardData();
    if (currentTab === 'INCIDENT') fetchIncidents(searchType, keyword);
    if (currentTab === 'SERVICE_REQUEST') fetchServiceRequests();
    if (currentTab === 'CHANGE') fetchChanges();
    if (currentTab === 'CMDB') fetchCMDB();
  };

  return (
    <div className="app-container">
      {/* 🌟 탭 순서 적용: 대시보드 -> 서비스 -> 장애 -> 변경 -> CMDB */}
      <nav className="main-nav">
        <button className={`nav-tab ${currentTab === 'DASHBOARD' ? 'active' : ''}`} onClick={() => setCurrentTab('DASHBOARD')}>대시보드</button>
        
        {/* 🌟 새로 추가된 이벤트 관제 탭 */}
        <button className={`nav-tab ${currentTab === 'EVENT' ? 'active' : ''}`} onClick={() => setCurrentTab('EVENT')} style={{ color: currentTab === 'EVENT' ? '#ef4444' : '#475569', fontWeight: 'bold' }}>
          🚨 이벤트 관제
        </button>

        <button className={`nav-tab ${currentTab === 'SERVICE_REQUEST' ? 'active' : ''}`} onClick={() => setCurrentTab('SERVICE_REQUEST')}>서비스 요청</button>
        <button className={`nav-tab ${currentTab === 'INCIDENT' ? 'active' : ''}`} onClick={() => setCurrentTab('INCIDENT')}>장애 관리</button>
        <button className={`nav-tab ${currentTab === 'CHANGE' ? 'active' : ''}`} onClick={() => setCurrentTab('CHANGE')}>변경 관리</button>
        <button className={`nav-tab ${currentTab === 'CMDB' ? 'active' : ''}`} onClick={() => setCurrentTab('CMDB')}>자산/CMDB</button>
        
        {/* 🌟 새로 추가된 SLM 탭 */}
        <button className={`nav-tab ${currentTab === 'SLM' ? 'active' : ''}`} onClick={() => setCurrentTab('SLM')} style={{ color: currentTab === 'SLM' ? 'var(--primary)' : '#475569', fontWeight: 'bold' }}>
          📊 SLM (서비스 수준)
        </button>

        {/* 🌟 시스템 관리 탭 추가 */}
        <button className={`nav-tab ${currentTab === 'SYSTEM' ? 'active' : ''}`} onClick={() => setCurrentTab('SYSTEM')} style={{ marginLeft: 'auto', color: currentTab === 'SYSTEM' ? 'var(--primary)' : '#475569' }}>
          ⚙️ 시스템 관리
        </button>
      
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
            {serviceSubTab === 'CATALOG' ? <CatalogGrid items={catalogs} /> : <ServiceRequestTable data={serviceRequests} onRowClick={setSelectedRequest} />}
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

        {currentTab === 'CHANGE' && (
          <>
            <div className="action-bar">
              <h3 style={{ margin: 0, color: 'var(--text-main)' }}>시스템 변경 요청(CR) 현황</h3>
              <button className="btn btn-primary" onClick={() => setChangeModalOpen(true)}>+ 변경 요청서 작성</button>
            </div>
            <ChangeRequestTable data={changeRequests} onRowClick={setSelectedChange} />
          </>
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
      {isChangeModalOpen && <ChangeRequestModal onClose={() => setChangeModalOpen(false)} onRefresh={refreshAll} />}
      {selectedChange && <ChangeDetailModal request={selectedChange} onClose={() => setSelectedChange(null)} onRefresh={refreshAll} />}
      {/* 🌟 CMDB 등록 모달 렌더링 */}
      {isCmdbModalOpen && <CMDBRegistrationModal onClose={() => setCmdbModalOpen(false)} onRefresh={refreshAll} />}
    </div>
  );
}

export default App;