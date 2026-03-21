package com.itsm.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "incident")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident extends BaseTicket {

    @Column(length = 20)
    private String impact; // 비즈니스 영향도 (High, Medium, Low)

    @Column(length = 20)
    private String urgency; // 긴급도 (High, Medium, Low)

    @Column(name = "root_cause", length = 500)
    private String rootCause; // 장애 근본 원인

    @Column(name = "restored_at")
    private LocalDateTime restoredAt; // 실제 서비스가 복구된 시간
}
