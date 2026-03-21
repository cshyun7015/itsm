package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class Problem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;            // 문제 제목

    @Column(length = 1000)
    private String description;      // 문제 상세 현상

    private String status = "OPEN";  // 상태 (OPEN, INVESTIGATING, KNOWN_ERROR, RESOLVED)
    private String priority;         // 우선순위

    @Column(length = 1000)
    private String rootCause;        // 🌟 근본 원인 (Root Cause)

    @Column(length = 1000)
    private String workaround;       // 🌟 임시 해결책 (Workaround) - 장애 발생 시 즉시 적용할 매뉴얼

    private String managerName;      // 문제 관리 담당자

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime targetResolutionDate; // 목표 해결 일자

    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;         // 관련 고객사
}