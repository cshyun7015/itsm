import React, { useState } from 'react';
import SummaryCards from './SummaryCards';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = ({ data }) => {
  const [isGenerating, setIsGenerating] = useState(false);

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
    </div>
  );
};

const chartCardStyle = { backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' };
const chartTitleStyle = { margin: '0 0 1.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '700' };

export default Dashboard;