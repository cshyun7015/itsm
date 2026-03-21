package com.itsm.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IncidentRequestDto {
    private Long companyId;       // 소속 고객사 ID
    private String title;         // 티켓 제목
    private String description;   // 상세 내용
    private String requesterName; // 요청자명
    private String priority;      // 우선순위 (CRITICAL, HIGH, MEDIUM, LOW)
}
