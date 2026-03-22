package com.itsm.backend.service;

import com.itsm.backend.domain.Incident;
import com.itsm.backend.domain.TicketStatus;
import com.itsm.backend.dto.DashboardDto;
import com.itsm.backend.repository.CIRepository;
import com.itsm.backend.repository.CompanyRepository;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final IncidentRepository incidentRepository;
    private final ServiceRequestRepository requestRepository;
    private final CompanyRepository companyRepository;
    private final CIRepository ciRepository; // 자산 수 카운트용 추가

    @Transactional(readOnly = true)
    public DashboardDto getSummary() {
        DashboardDto dashboard = new DashboardDto();

        // 1. 핵심 요약 데이터 수집
        DashboardDto.SummaryData summary = new DashboardDto.SummaryData();
        summary.setOpenIncidents(incidentRepository.countByStatus(TicketStatus.OPEN));
        summary.setInProgressIncidents(incidentRepository.countByStatus(TicketStatus.IN_PROGRESS));
        summary.setPendingRequests(requestRepository.countByApprovalStatus("PENDING"));
        summary.setTotalCompanies(companyRepository.count());
        summary.setTotalAssets(ciRepository.count());

        // SLA 준수율 계산
        long breached = incidentRepository.countBySlaBreached(true);
        long compliant = incidentRepository.countBySlaBreached(false);
        long totalSla = breached + compliant;
        double rate = totalSla == 0 ? 100.0 : (double) compliant / totalSla * 100;
        summary.setSlaComplianceRate(Math.round(rate * 10.0) / 10.0); // 소수점 1자리

        dashboard.setSummary(summary);

        // 2. 상태별 차트 데이터 수집
        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] result : incidentRepository.countByStatusGroup()) {
            statusMap.put(result[0].toString(), (Long) result[1]);
        }
        dashboard.setIncidentsByStatus(statusMap);

        // 3. 우선순위별 차트 데이터 수집
        Map<String, Long> priorityMap = new HashMap<>();
        for (Object[] result : incidentRepository.countByPriorityGroup()) {
            priorityMap.put(result[0].toString(), (Long) result[1]);
        }
        dashboard.setIncidentsByPriority(priorityMap);

        // 4. 최근 인시던트 5건 수집
        List<DashboardDto.RecentIncidentDto> recentList = incidentRepository.findTop5ByOrderByCreatedAtDesc()
                .stream().map(this::convertToRecentDto).collect(Collectors.toList());
        dashboard.setRecentIncidents(recentList);

        return dashboard;
    }

    private DashboardDto.RecentIncidentDto convertToRecentDto(Incident inc) {
        DashboardDto.RecentIncidentDto dto = new DashboardDto.RecentIncidentDto();
        dto.setId(inc.getId());
        dto.setTitle(inc.getTitle());
        dto.setStatus(inc.getStatus().name());
        dto.setPriority(inc.getPriority() != null ? inc.getPriority().name() : "-");
        dto.setCreatedAt(inc.getCreatedAt().toString());
        return dto;
    }
}