package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class SlaPolicy {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String policyName;   // 정책명 (예: 긴급 장애 해결 정책)
    private String targetType;   // 적용 대상 (예: INCIDENT, SERVICE_REQUEST)
    private String priority;     // 적용 우선순위 (CRITICAL, HIGH, MEDIUM, LOW 등)

    private Integer targetResolutionHours; // 목표 해결 시간 (단위: 시간)

    private String description;  // 정책 설명
    private boolean isActive = true; // 활성화 여부
}