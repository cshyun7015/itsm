// 앞으로 모든 백엔드 요청은 기본 fetch 대신 이 apiFetch를 사용합니다.
export const apiFetch = async (endpoint, options = {}) => {
  // 1. 브라우저 금고(LocalStorage)에서 열쇠(토큰)를 꺼냅니다.
  const token = localStorage.getItem('token');
  
  // 2. 헤더에 열쇠를 예쁘게 포장(Bearer)해서 넣습니다.
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 3. 백엔드로 출발!
  const response = await fetch(`http://localhost:8080/api${endpoint}`, {
    ...options,
    headers,
  });

  // 4. 만약 열쇠가 만료되었거나 가짜라면 (401 에러)
  if (response.status === 401) {
    alert('로그인이 만료되었습니다. 다시 로그인해 주세요.');
    localStorage.clear();
    window.location.reload(); // 강제로 새로고침하여 로그인 화면으로 돌려보냅니다.
    throw new Error('Unauthorized');
  }

  return response;
};