package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name; // 고객사명 (예: 구글 코리아)

    @Column(unique = true, length = 50)
    private String code; // 식별 코드 (예: GOOGLE-KR)

    @Column(length = 200)
    private String domain; // 고객사 이메일 도메인 (자동 맵핑용)

    @Column(length = 100)
    private String managerName; // 고객사 측 IT 담당자
}
