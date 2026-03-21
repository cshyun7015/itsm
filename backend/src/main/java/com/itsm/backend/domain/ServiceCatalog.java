package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_catalog")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCatalog extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name; // 카탈로그 명 (예: 사내 메신저 계정 생성)

    @Column(length = 500)
    private String description; // 서비스 상세 설명

    @Column(length = 50)
    private String category; // 카테고리 (예: SOFTWARE, HARDWARE, ACCESS)

    @Column(name = "estimated_days")
    private Integer estimatedDays; // 예상 처리 소요 일수 (SLA 기준)

    @Column(name = "is_active")
    private Boolean isActive = true; // 서비스 제공 활성화 여부
}
