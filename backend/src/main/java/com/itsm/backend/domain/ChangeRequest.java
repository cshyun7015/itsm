package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class ChangeRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String reason;      // 변경 사유
    private String riskLevel;   // 영향도/위험도 (LOW, MEDIUM, HIGH)
    private String plan;        // 실행 계획
    private String backoutPlan; // 원복 계획

    private String requesterName;
    private String status;      // DRAFT, CAB_APPROVAL, SCHEDULED, COMPLETED, REJECTED

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime scheduledAt; // 변경 예정일
}
