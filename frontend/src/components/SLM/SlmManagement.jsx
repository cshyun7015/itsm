import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import SlaPolicyTable from './SlaPolicyTable';
import SlaMetricTable from './SlaMetricTable';

function SlmManagement() {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <AssuredWorkloadIcon color="primary" fontSize="large" />
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          SLA 수준 관리 (Service Level Management)
        </Typography>
      </Box>

      {/* 🌟 탭 네비게이션 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
          <Tab label="SLA 정책 관리" sx={{ fontWeight: 'bold', fontSize: '1.05rem' }} />
          <Tab label="SLA 측정 지표 관리" sx={{ fontWeight: 'bold', fontSize: '1.05rem' }} />
        </Tabs>
      </Box>

      {/* 🌟 선택된 탭에 따라 컴포넌트 렌더링 */}
      {tabIndex === 0 && <SlaPolicyTable />}
      {tabIndex === 1 && <SlaMetricTable />}
    </Box>
  );
}

export default SlmManagement;