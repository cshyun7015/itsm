package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "incident_history")
@Getter
@Setter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class IncidentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Column(name = "changed_by", nullable = false)
    private String changedBy; // 변경을 수행한 사람 (사번 또는 이름)

    @Column(name = "previous_status", length = 20)
    @Enumerated(EnumType.STRING)
    private TicketStatus previousStatus;

    @Column(name = "new_status", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private TicketStatus newStatus;

    @Column(name = "update_comment", length = 500)
    private String updateComment; // 처리 내역이나 코멘트

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt; // 변경 발생 시간
}
