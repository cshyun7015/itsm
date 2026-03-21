package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "service_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest extends BaseTicket {

    // 🌟 카탈로그 엔티티와의 연관관계 추가
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    private ServiceCatalog catalog;

    @Column(name = "approval_status", length = 20)
    private String approvalStatus; // 승인 상태 (PENDING, APPROVED, REJECTED)

    @Column(name = "target_delivery_date")
    private LocalDate targetDeliveryDate; // 희망/목표 제공 일자
}
