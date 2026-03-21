package com.itsm.backend.domain;

public enum TicketStatus {
    OPEN,           // 신규 접수
    IN_PROGRESS,    // 처리 중
    PENDING,        // 대기 중 (사용자 응답 대기, 외부 벤더 대기 등)
    RESOLVED,       // 해결됨 (인시던트 복구 또는 요청 완료)
    CLOSED,         // 완전 종료 (사용자 확인 완료)
    CANCELED        // 취소됨
}
