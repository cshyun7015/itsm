package com.itsm.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceCatalogDto {
    private String name;
    private String description;
    private String category;          // HW, SW, ACCESS, INFRA, GENERAL
    private Integer estimatedDays;    // 예상 소요 일수
    private Boolean isActive;         // 활성화 여부

    // 🌟 새롭게 추가된 실무형 속성들
    private Boolean approvalRequired; // 결재 필요 여부
    private Integer cost;             // 처리 비용 (0이면 무료)
    private String targetAudience;    // 대상자 (ALL, IT_ONLY, NEW_HIRE 등)
    private String iconCode;          // UI 표현을 위한 아이콘 이름
}