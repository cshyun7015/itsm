package com.itsm.backend.service;

import com.itsm.backend.domain.Incident;
import com.itsm.backend.domain.Priority;
import com.itsm.backend.domain.TicketStatus;
import com.itsm.backend.dto.DashboardDto;
import com.itsm.backend.repository.CIRepository;
import com.itsm.backend.repository.CompanyRepository;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.repository.ServiceRequestRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock private IncidentRepository incidentRepository;
    @Mock private ServiceRequestRepository requestRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private CIRepository ciRepository;

    @InjectMocks private DashboardService dashboardService;

    @Test
    @DisplayName("대시보드 통계 요약 데이터 수집 테스트")
    void getSummaryTest() {
        // Given (Mock 데이터 세팅)
        when(incidentRepository.countByStatus(TicketStatus.OPEN)).thenReturn(15L);
        when(requestRepository.countByApprovalStatus("PENDING")).thenReturn(5L);
        when(incidentRepository.countBySlaBreached(true)).thenReturn(1L);
        when(incidentRepository.countBySlaBreached(false)).thenReturn(9L); // 총 10건 중 9건 준수 = 90.0%

        // 상태별 그룹 데이터 Mock
        when(incidentRepository.countByStatusGroup()).thenReturn(Arrays.asList(
                new Object[]{TicketStatus.OPEN, 15L},
                new Object[]{TicketStatus.RESOLVED, 30L}
        ));

        // 최근 인시던트 Mock
        Incident inc = new Incident();
        inc.setId(1L);
        inc.setTitle("최근 장애 테스트");
        inc.setStatus(TicketStatus.OPEN);
        inc.setPriority(Priority.HIGH);
        inc.setCreatedAt(LocalDateTime.now());
        when(incidentRepository.findTop5ByOrderByCreatedAtDesc()).thenReturn(Collections.singletonList(inc));

        // When
        DashboardDto result = dashboardService.getSummary();

        // Then
        assertNotNull(result);
        assertEquals(15L, result.getSummary().getOpenIncidents());
        assertEquals(5L, result.getSummary().getPendingRequests());
        assertEquals(90.0, result.getSummary().getSlaComplianceRate()); // SLA 90% 확인

        assertEquals(15L, result.getIncidentsByStatus().get("OPEN"));
        assertEquals(30L, result.getIncidentsByStatus().get("RESOLVED"));

        assertEquals(1, result.getRecentIncidents().size());
        assertEquals("최근 장애 테스트", result.getRecentIncidents().get(0).getTitle());
    }
}