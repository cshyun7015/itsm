package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users") // 🌟 데이터베이스 예약어 충돌 방지를 위해 'users'로 테이블명 지정
@Getter @Setter
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;    // 로그인 아이디 (예: admin)

    private String name;       // 이름 (예: 홍길동)
    private String department; // 소속 부서

    // 🌟 암호화된 비밀번호를 저장할 필드 (필수)
    @Column(nullable = false)
    private String password;

    private Role role;       // 권한 (ADMIN, ENGINEER, USER)

    private String status = "ACTIVE"; // 상태 (ACTIVE, INACTIVE)
}