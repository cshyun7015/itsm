import { useState, useEffect } from 'react';

export const useIncidents = () => {
  const [incidents, setIncidents] = useState([]);

  const fetchIncidents = async (type = 'requester', keyword = '') => {
    // 🌟 검색 조건에 따른 URL 생성
    let url = 'http://localhost:8080/api/incidents/search';
    const params = new URLSearchParams();
    if (keyword) {
      params.append('searchType', type);
      params.append('keyword', keyword);
      url += `?${params.toString()}`;
    } else {
      url += `?searchType=requester&keyword=`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP 에러 발생! 상태코드: ${response.status}`);
      }

      const data = await response.json();
      setIncidents(data);
    } catch (err) {
      console.error('❌ 인시던트 조회 실패:', err.message);
      // Failed to fetch인 경우 서버 연결 문제일 가능성이 큼
      if (err.message === 'Failed to fetch') {
        console.warn('💡 백엔드 서버(8080)가 실행 중인지, 혹은 CORS 설정이 되어 있는지 확인하세요.');
      }
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchIncidents();
  }, []);

  return { incidents, fetchIncidents };
};