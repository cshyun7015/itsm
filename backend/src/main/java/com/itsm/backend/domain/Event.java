package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class Event {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String source;      // 발생 출처 (예: Zabbix, Datadog, AWS)
    private String severity;    // 심각도 (INFO, WARNING, CRITICAL)
    private String message;     // 이벤트 상세 내용 (예: "CPU 사용량 95% 초과")
    private String node;        // 발생 노드 (IP 주소 또는 호스트명)

    private LocalDateTime timestamp = LocalDateTime.now(); // 발생 일시

    private String status = "NEW"; // 처리 상태 (NEW, PROCESSED, IGNORED)

    private Long relatedIncidentId; // 만약 이 이벤트로 인해 장애 티켓이 생성되었다면 연결할 ID
}