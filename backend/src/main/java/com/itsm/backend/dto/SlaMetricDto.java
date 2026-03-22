package com.itsm.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SlaMetricDto {
    private String metricName;     // 지표명 (예: 월간 SLA 준수율)
    private Long policyId;         // 연결된 정책 ID
    private String unit;           // 단위 (PERCENTAGE, HOURS, DAYS)
    private Double targetValue;    // 목표치 (예: 99.9)
    private Double actualValue;    // 현재 측정치 (예: 98.5)
    private String measurementPeriod; // 측정 주기 (MONTHLY, WEEKLY)
}