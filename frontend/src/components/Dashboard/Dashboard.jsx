import React, { useState, useEffect } from 'react';
import SummaryCards from './SummaryCards';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = ({ data }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // 🌟 SLA 통계 상태 관리
  const [slaStats, setSlaStats] = useState({ total: 0, breached: 0, compliant: 0, complianceRate: '0.0' });

  // 🌟 컴포넌트 마운트 시 SLA API 호출
  useEffect(() => {
    fetch('http://localhost:8080/api/slm/statistics')
      .then(res => res.json())
      .then(setSlaStats)
      .catch(err => console.error('SLA 통계 로드 실패:', err));
  }, []);

  // SVG 도넛 차트 계산 로직
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  // 준수율만큼만 초록색 선을 그리고, 나머지는 비워둡니다 (CSS stroke-dashoffset 활용)
  const strokeDashoffset = circumference - (circumference * parseFloat(slaStats.complianceRate)) / 100;

  // 🌟 샘플 데이터 생성 API 호출 함수
  const handleGenerateData = () => {
    if(!window.confirm('각 테이블에 100개씩 총 400개의 가짜 데이터를 생성합니다. 진행하시겠습니까?')) return;
    
    setIsGenerating(true);
    fetch('http://localhost:8080/api/dummy/generate', { method: 'POST' })
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        window.location.reload(); // 데이터 갱신을 위해 페이지 새로고침
      })
      .catch(err => {
        console.error(err);
        alert('데이터 생성 중 오류가 발생했습니다.');
      })
      .finally(() => setIsGenerating(false));
  };

  const pieData = [
    { name: '오픈된 장애', value: data?.openIncidents || 0, color: '#ef4444' },
    { name: '처리 중인 작업', value: data?.inProgressIncidents || 0, color: '#3b82f6' },
    { name: '승인 대기 요청', value: data?.pendingRequests || 0, color: '#f59e0b' },
  ];

  const weeklyData = [
    { name: '월', 장애: 4, 요청: 2, 변경: 0 },
    { name: '화', 장애: 3, 요청: 5, 변경: 1 },
    { name: '수', 장애: 5, 요청: 3, 변경: 2 },
    { name: '목', 장애: 2, 요청: 8, 변경: 0 },
    { name: '금', 장애: 1, 요청: 4, 변경: 3 },
  ];

  return (
    <div className="dashboard-container">
      <div className="action-bar" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.3rem' }}>ITSM 종합 현황 대시보드</h3>
        {/* 🌟 샘플 데이터 생성 버튼 */}
        <button 
          className="btn btn-outline" 
          onClick={handleGenerateData} 
          disabled={isGenerating}
          style={{ borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 'bold' }}
        >
          {isGenerating ? '⏳ 데이터 생성 중...' : '🛠️ 샘플 데이터 100개씩 생성'}
        </button>
      </div>
      
      <SummaryCards data={data} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
        <div style={chartCardStyle}>
          <h4 style={chartTitleStyle}>진행 중인 티켓 분포</h4>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={chartCardStyle}>
          <h4 style={chartTitleStyle}>주간 티켓 접수 추이 (예시)</h4>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="장애" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                <Bar dataKey="요청" stackId="a" fill="#3b82f6" />
                <Bar dataKey="변경" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 🌟 신규: SLA 통계 및 도넛 차트 영역 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
        
        {/* 왼쪽: 도넛 차트 */}
        <div className="stat-card" style={{ padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', alignSelf: 'flex-start' }}>🎯 SLA 준수율</h3>
          
          <div style={{ position: 'relative', width: '160px', height: '160px' }}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
              {/* 배경 원 (빨간색 - 위반 부분) */}
              <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#fee2e2" strokeWidth="15" />
              {/* 진행 원 (초록색 - 준수 부분) */}
              <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#10b981" strokeWidth="15" 
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} strokeLinecap="round" 
              />
            </svg>
            {/* 가운데 퍼센트 텍스트 */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{slaStats.complianceRate}%</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 상세 수치 */}
        <div className="stat-card" style={{ padding: '2rem', backgroundColor: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)' }}>📊 서비스 수준(SLM) 현황 요약</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>전체 발생 인시던트</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{slaStats.total}</div>
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', color: '#166534', marginBottom: '0.5rem' }}>SLA 준수 완료 / 진행</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>{slaStats.compliant}</div>
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', color: '#991b1b', marginBottom: '0.5rem' }}>SLA 기한 초과 (Breach)</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444' }}>{slaStats.breached}</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

const chartCardStyle = { backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' };
const chartTitleStyle = { margin: '0 0 1.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '700' };

export default Dashboard;