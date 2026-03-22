import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api'; // 🌟 우리가 만든 심부름꾼 불러오기
import SummaryCards from './SummaryCards';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [slaStats, setSlaStats] = useState({ total: 0, breached: 0, compliant: 0, complianceRate: '0.0' });
  
  // 🌟 2. 요약 데이터를 담을 빈 그릇(상태)을 하나 만들어 줍니다.
  const [summaryData, setSummaryData] = useState({});

  const [responseTime, setResponseTime] = useState(null);
  const [isPerfWarning, setIsPerfWarning] = useState(false);

  const [serverStatus, setServerStatus] = useState(null); // 'UP' 또는 'DOWN'

  const [memoryUsage, setMemoryUsage] = useState(null);
  const [isWarning, setIsWarning] = useState(false); // 🌟 경고 상태를 관리하는 바구니
  // 🌟 용량 임계치(Threshold) 설정: 400MB를 넘으면 위험하다고 판단!
  const THRESHOLD_MB = 400;

  useEffect(() => {
    // SLA 통계 로드
    apiFetch('/slm/statistics')
      .then(res => res.json())
      .then(setSlaStats)
      .catch(err => console.error('SLA 통계 로드 실패:', err));

    // 🌟 3. 백엔드에서 요약 데이터를 직접 가져와서 그릇(summaryData)에 담습니다!
    apiFetch('/dashboard/summary')
      .then(res => res.json())
      .then(setSummaryData)
      .catch(err => console.error('대시보드 요약 로드 실패:', err));
  }, []);

  // SVG 도넛 차트 계산 로직
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * parseFloat(slaStats.complianceRate)) / 100;

  const handleGenerateData = () => {
    if(!window.confirm('각 테이블에 100개씩 총 400개의 가짜 데이터를 생성합니다. 진행하시겠습니까?')) return;
    setIsGenerating(true);
    // 참고: 이 부분도 apiFetch로 바꾸시면 토큰이 담겨서 더 안전합니다!
    apiFetch('/dummy/generate', { method: 'POST' })
      .then(res => res.text())
      .then(msg => {
        alert(msg);
        window.location.reload(); 
      })
      .catch(err => {
        console.error(err);
        alert('데이터 생성 중 오류가 발생했습니다.');
      })
      .finally(() => setIsGenerating(false));
  };

  // 🌟 4. 부모가 준 data 대신, 내가 직접 가져온 summaryData를 사용합니다!
  const pieData = [
    { name: '오픈된 장애', value: summaryData.openIncidents || 0, color: '#ef4444' },
    { name: '처리 중인 작업', value: summaryData.inProgressIncidents || 0, color: '#3b82f6' },
    { name: '승인 대기 요청', value: summaryData.pendingRequests || 0, color: '#f59e0b' },
  ];

  const weeklyData = [
    { name: '월', 장애: 4, 요청: 2, 변경: 0 },
    { name: '화', 장애: 3, 요청: 5, 변경: 1 },
    { name: '수', 장애: 5, 요청: 3, 변경: 2 },
    { name: '목', 장애: 2, 요청: 8, 변경: 0 },
    { name: '금', 장애: 1, 요청: 4, 변경: 3 },
  ];

  // 🌟 서버의 현재 용량(메모리)을 측정하는 함수
  const checkServerCapacity = () => {
    fetch('http://localhost:8080/actuator/metrics/jvm.memory.used')
      .then(res => res.json())
      .then(data => {
        const usedMemoryMB = (data.measurements[0].value / (1024 * 1024)).toFixed(2);
        setMemoryUsage(usedMemoryMB);

        // 🌟 핵심 로직: 현재 용량이 임계치를 넘었는지 검사합니다.
        if (parseFloat(usedMemoryMB) > THRESHOLD_MB) {
          setIsWarning(true); // 빨간불 켜기!

          // 🌟 로컬 스토리지 대신 백엔드 웹훅 API로 이벤트를 쏩니다!
          apiFetch('/webhook/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              severity: 'CRITICAL',
              source: 'Capacity Monitor',
              message: `[용량 초과] 서버 메모리 위험 수치 도달 (${usedMemoryMB} MB)`,
              node: 'localhost:8080'
            })
          }).catch(err => console.error('웹훅 전송 실패:', err));

          console.warn(`🚨 [이벤트 발생] 서버 메모리가 ${THRESHOLD_MB}MB를 초과했습니다!`);
          
          // 💡 실제 엔터프라이즈 환경이라면 여기서 아래와 같은 API를 몰래 호출합니다.
          // apiFetch('/api/incidents', { method: 'POST', body: JSON.stringify({ title: '서버 메모리 용량 초과 장애 발생' }) });
        } else {
          setIsWarning(false); // 정상 상태면 파란불!
        }
      })
      .catch(err => console.error('용량 지표 로드 실패:', err));
  };

  // 🌟 서버의 성능(평균 응답 시간)을 측정하는 함수
const checkServerPerformance = () => {
  // Actuator의 HTTP 요청 통계 지표를 가져옵니다.
  fetch('http://localhost:8080/actuator/metrics/http.server.requests')
    .then(res => res.json())
    .then(data => {
      // 1. 총 요청 횟수 (COUNT)
      const count = data.measurements.find(m => m.statistic === 'COUNT')?.value || 0;
      // 2. 총 소요 시간 (TOTAL_TIME, 초 단위)
      const totalTime = data.measurements.find(m => m.statistic === 'TOTAL_TIME')?.value || 0;

      if (count === 0) {
        alert("아직 서버로 요청된 API가 없습니다. 탭을 몇 번 누른 뒤 다시 시도해 주세요!");
        return;
      }

      // 3. 평균 응답 시간 계산 (초 -> 밀리초 변환)
      const avgTimeMs = ((totalTime / count) * 1000).toFixed(2);
      console.log(`⚡ 현재 서버 평균 응답 시간: ${avgTimeMs} ms`);
      setResponseTime(avgTimeMs);

      // 🌟 성능 임계치 설정: 평균 응답이 500ms(0.5초)를 넘어가면 성능 지연으로 판단!
      if (parseFloat(avgTimeMs) > 500) {
        setIsPerfWarning(true);
        // (여기서도 용량 관리 때처럼 Webhook API를 쏴서 이벤트를 발생시킬 수 있습니다!)
      } else {
        setIsPerfWarning(false);
      }
    })
    .catch(err => console.error('성능 지표 로드 실패:', err));
  };

  // 🌟 서버의 가용성(생존 여부)을 확인하는 함수 (Health Check)
  const checkServerAvailability = () => {
    // Actuator의 health 엔드포인트를 찔러봅니다.
    fetch('http://localhost:8080/actuator/health')
      .then(res => {
        // 서버가 죽었거나 네트워크가 끊기면 이쪽으로 빠집니다.
        if (!res.ok) throw new Error('서버 응답 없음');
        return res.json();
      })
      .then(data => {
        console.log(`💓 현재 서버 상태: ${data.status}`); // 보통 "UP"이 옵니다.
        setServerStatus(data.status);
      })
      .catch(err => {
        console.error('가용성 체크 실패 - 서버가 죽었습니다!', err);
        setServerStatus('DOWN'); // 에러가 나면 무조건 DOWN(장애) 처리!
        
        // 💡 실제 환경에서는 즉시 EventConsole로 [CRITICAL] 이벤트를 쏩니다!
      });
  };

  return (
    <div className="dashboard-container">
      <div className="action-bar" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.3rem' }}>ITSM 종합 현황 대시보드</h3>
        <button 
          className="btn btn-outline" 
          onClick={handleGenerateData} 
          disabled={isGenerating}
          style={{ borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 'bold' }}
        >
          {isGenerating ? '⏳ 데이터 생성 중...' : '🛠️ 샘플 데이터 100개씩 생성'}
        </button>
      </div>
      
      {/* 🌟 5. SummaryCards 에도 내가 가져온 summaryData를 넘겨줍니다! */}
      <SummaryCards data={summaryData} />

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

      {/* 🌟 용량 측정 테스트 영역 */}
      {/* 🌟 경고 상태(isWarning)에 따라 배경색과 테두리 색상이 동적으로 변합니다! */}
      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: isWarning ? '#fef2f2' : '#f8fafc', 
        border: `2px solid ${isWarning ? '#ef4444' : '#cbd5e1'}`, 
        borderRadius: '8px', 
        marginBottom: '2rem',
        transition: 'all 0.3s ease'
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: isWarning ? '#b91c1c' : '#0f172a' }}>
          🖥️ 실시간 서버 용량(Capacity) 모니터링
        </h4>
        
        <button 
          className="btn" 
          onClick={checkServerCapacity} 
          style={{ 
            backgroundColor: isWarning ? '#ef4444' : '#3b82f6', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '6px', 
            cursor: 'pointer' 
          }}
        >
          지금 서버 메모리 얼마나 쓰고 있어? 🔍
        </button>
        
        {memoryUsage && (
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>
              현재 사용 중인 메모리: <span style={{ color: isWarning ? '#ef4444' : '#3b82f6' }}>{memoryUsage} MB</span>
              <span style={{ fontSize: '0.9rem', color: '#64748b', marginLeft: '10px', fontWeight: 'normal' }}>
                (위험 임계치: {THRESHOLD_MB} MB)
              </span>
            </p>
            
            {/* 🌟 임계치를 초과했을 때만 나타나는 경고 메시지 영역 */}
            {isWarning && (
              <div style={{ 
                marginTop: '1rem', padding: '1rem', backgroundColor: '#fee2e2', 
                borderLeft: '4px solid #b91c1c', color: '#991b1b', fontWeight: 'bold' 
              }}>
                🚨 [용량 경고] 메모리 사용량이 안전 기준치를 초과했습니다! <br/>
                <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#7f1d1d' }}>
                  * 시스템 자동화: 현재 상태가 5분 이상 지속될 경우, 이벤트 관제 센터에 알람이 전송되며 자동 장애 티켓이 발행됩니다.
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: isPerfWarning ? '#fef2f2' : '#f8fafc', 
        border: `2px solid ${isPerfWarning ? '#ef4444' : '#cbd5e1'}`, 
        borderRadius: '8px', 
        marginBottom: '2rem' 
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: isPerfWarning ? '#b91c1c' : '#0f172a' }}>
          ⚡ 실시간 서버 성능(Performance) 모니터링
        </h4>
        <button className="btn" onClick={checkServerPerformance} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
          현재 API 평균 응답 속도 확인 ⏱️
        </button>
        
        {responseTime && (
          <div style={{ marginTop: '1.5rem' }}>
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
              평균 API 응답 시간: <span style={{ color: isPerfWarning ? '#ef4444' : '#10b981' }}>{responseTime} ms</span>
              <span style={{ fontSize: '0.9rem', color: '#64748b', marginLeft: '10px', fontWeight: 'normal' }}>
                (정상 기준: 500ms 이하)
              </span>
            </p>
            
            {isPerfWarning && (
              <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee2e2', borderLeft: '4px solid #b91c1c', color: '#991b1b', fontWeight: 'bold' }}>
                ⚠️ [성능 경고] API 응답 속도가 지연되고 있습니다! DB 쿼리 튜닝이나 병목 구간 확인이 필요합니다.
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ 
        padding: '1.5rem', 
        backgroundColor: serverStatus === 'DOWN' ? '#fef2f2' : '#f8fafc', 
        border: `2px solid ${serverStatus === 'DOWN' ? '#ef4444' : '#cbd5e1'}`, 
        borderRadius: '8px', 
        marginBottom: '2rem' 
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: serverStatus === 'DOWN' ? '#b91c1c' : '#0f172a' }}>
          💓 실시간 시스템 가용성(Availability) 모니터링
        </h4>
        <button className="btn" onClick={checkServerAvailability} style={{ backgroundColor: '#8b5cf6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer' }}>
          현재 서버 살아있어? (Health Check) 🩺
        </button>
        
        {serverStatus && (
          <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
              현재 시스템 상태: 
            </p>
            
            {/* 🌟 상태에 따라 초록불(UP) 또는 빨간불(DOWN) 표시 */}
            {serverStatus === 'UP' ? (
              <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                🟢 정상 구동 중 (UP)
              </span>
            ) : (
              <span style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                🔴 서비스 장애 (DOWN)
              </span>
            )}
          </div>
        )}
        
        {serverStatus === 'DOWN' && (
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#fee2e2', borderLeft: '4px solid #b91c1c', color: '#991b1b', fontWeight: 'bold' }}>
            🚨 [가용성 경고] 서버와 통신할 수 없습니다! 즉시 인프라 팀에 장애(Incident) 티켓이 발송됩니다.
          </div>
        )}
      </div>

    </div>
  );
};

const chartCardStyle = { backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column' };
const chartTitleStyle = { margin: '0 0 1.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '700' };

export default Dashboard;