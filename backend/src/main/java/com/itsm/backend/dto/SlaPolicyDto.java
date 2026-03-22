package com.itsm.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SlaPolicyDto {
    private String policyName;    // 정책명 (예: VIP 고객 장애 조치)
    private String targetType;    // 적용 대상 (INCIDENT, REQUEST, PROBLEM)
    private String targetPriority;// 적용 우선순위 (CRITICAL, HIGH, MEDIUM)
    private Integer targetTime;   // 목표 시간(분/시간 단위 등)
    private String description;   // 상세 설명
    private String status;        // ACTIVE, INACTIVE
}