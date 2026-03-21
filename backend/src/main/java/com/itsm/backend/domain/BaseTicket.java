package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public abstract class BaseTicket extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TicketStatus status = TicketStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Priority priority = Priority.MEDIUM;

    // 추후 User 엔티티와 연관관계(@ManyToOne)로 변경할 수 있습니다.
    @Column(name = "requester_id", nullable = false)
    private String requesterId;

    @Column(name = "assignee_id")
    private String assigneeId;

    // 🌟 추가된 고객사 연관관계 (N:1)
    // FetchType.LAZY를 사용하여 티켓만 조회할 때 불필요하게 고객사 정보까지 긁어오는 성능 저하를 막습니다.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "requester_name", nullable = false)
    private String requesterName; // 요청자명 (향후 User 엔티티 연관관계로 고도화 가능)

    @Column(name = "assignee_name")
    private String assigneeName; // 처리자명
}
