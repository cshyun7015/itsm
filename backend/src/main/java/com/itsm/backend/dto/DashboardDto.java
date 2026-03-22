package com.itsm.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class DashboardDto {
    // 1. 최상단 핵심 요약 지표 (Summary Cards)
    private SummaryData summary;

    // 2. 차트 데이터 (Chart Data)
    private Map<String, Long> incidentsByStatus;   // 도넛 차트용 (상태별 장애 현황)
    private Map<String, Long> incidentsByPriority; // 바 차트용 (우선순위별 장애 현황)

    // 3. 최근 발생한 장애 목록 (최대 5건)
    private List<RecentIncidentDto> recentIncidents;

    @Data
    public static class SummaryData {
        private long openIncidents;
        private long inProgressIncidents;
        private long pendingRequests;
        private long totalCompanies;
        private long totalAssets;        // 총 자산(CI) 수
        private double slaComplianceRate; // SLA 준수율 (%)
    }

    @Data
    public static class RecentIncidentDto {
        private Long id;
        private String title;
        private String status;
        private String priority;
        private String createdAt;
    }
}