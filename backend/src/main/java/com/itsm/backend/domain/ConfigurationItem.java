package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class ConfigurationItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ciName;        // 자산명 (예: MacMini-Dev-01, MariaDB-Cluster)
    private String ciType;        // 분류 (SERVER, DATABASE, NETWORK, SOFTWARE)
    private String ipAddress;     // IP 주소
    private String environment;   // 환경 (PROD, DEV, STAGE)

    private String ownerName;     // 담당자
    private String status;        // 상태 (ACTIVE, IN_MAINTENANCE, RETIRED)
    private String description;   // 상세 스펙 및 설명

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime lastAuditedAt; // 마지막 실사/점검일
}
