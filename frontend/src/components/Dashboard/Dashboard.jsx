import React from 'react';
import SummaryCards from './SummaryCards';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = ({ data }) => {
  // 1. 도넛 차트용 데이터 (API에서 받은 요약 데이터 활용)
  const pieData = [
    { name: '오픈된 장애', value: data?.openIncidents || 0, color: '#ef4444' },
    { name: '처리 중인 작업', value: data?.inProgressIncidents || 0, color: '#3b82f6' },
    { name: '승인 대기 요청', value: data?.pendingRequests || 0, color: '#f59e0b' },
  ];

  // 2. 막대 차트용 주간 트렌드 가짜 데이터 (향후 API 연동을 위한 UI 템플릿)
  const weeklyData = [
    { name: '월', 장애: 4, 요청: 2, 변경: 0 },
    { name: '화', 장애: 3, 요청: 5, 변경: 1 },
    { name: '수', 장애: 5, 요청: 3, 변경: 2 },
    { name: '목', 장애: 2, 요청: 8, 변경: 0 },
    { name: '금', 장애: 1, 요청: 4, 변경: 3 },
  ];

  return (
    <div className="dashboard-container">
      <div className="action-bar" style={{ marginBottom: '2rem' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.3rem' }}>ITSM 종합 현황 대시보드</h3>
      </div>
      
      {/* 🌟 기존 상단에 있던 요약 카드를 대시보드 내부로 이동 */}
      <SummaryCards data={data} />

      {/* 🌟 시각화 차트 영역 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }}>
        
        {/* 첫 번째 차트: 현재 티켓 분포 (도넛 차트) */}
        <div style={chartCardStyle}>
          <h4 style={chartTitleStyle}>진행 중인 티켓 분포</h4>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  innerRadius={70} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 두 번째 차트: 주간 접수 트렌드 (막대 차트) */}
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

// 내부 스타일
const chartCardStyle = {
  backgroundColor: 'var(--surface)',
  padding: '1.5rem',
  borderRadius: 'var(--radius-lg)',
  border: '1px solid var(--border-light)',
  boxShadow: 'var(--shadow-sm)',
  display: 'flex',
  flexDirection: 'column'
};
const chartTitleStyle = { margin: '0 0 1.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '700' };

export default Dashboard;