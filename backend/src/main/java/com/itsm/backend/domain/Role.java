package com.itsm.backend.domain;

public enum Role {
    ROLE_USER,  // 일반 사용자 (서비스 요청, 장애 신고만 가능)
    ROLE_AGENT, // 서비스 데스크 담당자 (장애 처리, 문제 관리 가능)
    ROLE_ADMIN  // 시스템 관리자 (모든 권한, 시스템 설정 가능)
}