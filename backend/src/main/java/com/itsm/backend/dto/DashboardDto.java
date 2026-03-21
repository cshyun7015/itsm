package com.itsm.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    private long openIncidents;      // 접수된 장애 (OPEN)
    private long inProgressIncidents; // 처리 중인 장애 (IN_PROGRESS)
    private long pendingRequests;    // 승인 대기 중인 서비스 요청 (PENDING)
    private long totalCompanies;     // 관리 중인 고객사 수
}
