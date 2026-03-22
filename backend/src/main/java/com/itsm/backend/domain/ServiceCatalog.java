package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_catalog")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceCatalog extends BaseTimeEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(length = 50)
    private String category;

    private Integer estimatedDays;

    @Builder.Default
    private Boolean isActive = true;

    // 🌟 추가된 속성들
    @Builder.Default
    private Boolean approvalRequired = false; // 기본은 결재 불필요

    private Integer cost;             // 비용

    @Column(length = 50)
    private String targetAudience;    // 대상자

    @Column(length = 50)
    private String iconCode;          // 아이콘명 (예: LaptopMac, VpnKey)
}