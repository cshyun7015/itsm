import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export const useIncidents = (isAuthenticated) => { // 🌟 로그인 상태를 인자로 받음
  const [incidents, setIncidents] = useState([]);

  const fetchIncidents = (searchType = 'requester', keyword = '') => {
    // 🌟 인증되지 않았으면 아예 요청을 보내지 않음!
    if (!isAuthenticated) return; 

    apiFetch(`/incidents/search?searchType=${searchType}&keyword=${keyword}`)
      .then(res => res.json())
      .then(setIncidents)
      .catch(err => console.error(err));
  };

  useEffect(() => {
    // 🌟 로그인 성공 시에만 데이터를 가져오도록 설정
    if (isAuthenticated) {
      fetchIncidents();
    }
  }, [isAuthenticated]); // 🌟 로그인 상태가 바뀔 때만 트리거됨

  return { incidents, fetchIncidents };
};