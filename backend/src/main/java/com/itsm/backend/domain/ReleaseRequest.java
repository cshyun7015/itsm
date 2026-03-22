package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "release_records") // release는 DB 예약어일 수 있으므로 안전하게 변경
@Getter @Setter
public class ReleaseRecord {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String version;          // 버전 (예: v1.5.0)
    private String title;            // 배포 명칭

    @Column(length = 1000)
    private String description;      // 배포 상세 내용 (포함된 변경 사항 등)

    private String status = "PLANNING"; // PLANNING, BUILDING, TESTING, DEPLOYING, COMPLETED, FAILED
    private String releaseType;      // MAJOR, MINOR, EMERGENCY

    private String managerName;      // 배포 담당자

    private LocalDateTime targetDate; // 배포 예정 일시
    private LocalDateTime actualDate; // 실제 배포 완료 일시

    // 🌟 이전에 발생했던 에러를 교훈 삼아, Company 필드를 잊지 않고 추가합니다!
    @ManyToOne
    @JoinColumn(name = "company_id")
    private Company company;
}