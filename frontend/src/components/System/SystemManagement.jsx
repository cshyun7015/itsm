import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import UserTable from './UserTable';
import CompanyTable from './CompanyTable';
import CodeTable from './CodeTable';

function SystemManagement() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <SettingsApplicationsIcon color="primary" fontSize="large" />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          시스템 관리 (System Management)
        </Typography>
      </Box>

      {/* 🌟 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
          <Tab label="사용자 관리" sx={{ fontWeight: 'bold', fontSize: '1.05rem' }} />
          <Tab label="고객사 관리" sx={{ fontWeight: 'bold', fontSize: '1.05rem' }} />
          <Tab label="공통 코드 관리" sx={{ fontWeight: 'bold', fontSize: '1.05rem' }} />
        </Tabs>
      </Box>

      {/* 🌟 선택된 탭에 따라 컴포넌트 렌더링 */}
      {tabIndex === 0 && <UserTable />}
      {tabIndex === 1 && <CompanyTable />}
      {tabIndex === 2 && <CodeTable />}
    </Box>
  );
}

export default SystemManagement;