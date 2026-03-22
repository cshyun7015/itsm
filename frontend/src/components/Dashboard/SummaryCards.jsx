import React from 'react';
import { Box, Typography } from '@mui/material';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import DomainIcon from '@mui/icons-material/Domain';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

const SummaryCards = ({ data }) => {
  const cards = [
    { label: '미해결 장애 (OPEN)', value: data?.openIncidents || 0, color: '#ef4444', icon: <AssignmentLateIcon /> },
    { label: '처리 중 (IN PROGRESS)', value: data?.inProgressIncidents || 0, color: '#3b82f6', icon: <AutorenewIcon /> },
    { label: '승인 대기 (PENDING)', value: data?.pendingRequests || 0, color: '#f59e0b', icon: <HourglassTopIcon /> },
    { label: 'SLA 준수율 (%)', value: `${data?.slaComplianceRate || 100}%`, color: '#10b981', icon: <VerifiedUserIcon /> },
    { label: '관리 중인 자산 (CI)', value: data?.totalAssets || 0, color: '#8b5cf6', icon: <StorageIcon /> },
    { label: '등록된 고객사', value: data?.totalCompanies || 0, color: '#14b8a6', icon: <DomainIcon /> },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2, mb: 4 }}>
      {cards.map((card, index) => (
        <Box key={index} sx={{
          backgroundColor: '#1e293b', // 다크 테마 카드 배경
          padding: '1.5rem', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)', 
          borderBottom: `4px solid ${card.color}`, // 아래쪽 포인트 컬러
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-5px)' }
        }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 'bold' }}>{card.label}</Typography>
            <Typography sx={{ fontSize: '2rem', fontWeight: '900', color: '#f8fafc' }}>{card.value}</Typography>
          </Box>
          <Box sx={{ color: card.color, opacity: 0.8, transform: 'scale(1.8)', mr: 1 }}>
            {card.icon}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default SummaryCards;