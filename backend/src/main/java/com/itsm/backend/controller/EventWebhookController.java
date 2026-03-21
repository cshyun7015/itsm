package com.itsm.backend.controller;

import com.itsm.backend.domain.Event;
import com.itsm.backend.domain.Incident;
import com.itsm.backend.domain.Priority;
import com.itsm.backend.domain.TicketStatus;
// 🌟 Company와 CompanyRepository 임포트 추가
import com.itsm.backend.domain.Company;
import com.itsm.backend.repository.EventRepository;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/webhook")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EventWebhookController {

    private final EventRepository eventRepository;
    private final IncidentRepository incidentRepository;
    private final CompanyRepository companyRepository; // 🌟 고객사 리포지토리 추가

    @PostMapping("/events")
    public ResponseEntity<String> receiveEvent(@RequestBody Event event) {
        log.info("새로운 이벤트 수신: [{}] {} - {}", event.getSource(), event.getSeverity(), event.getMessage());

        // CRITICAL 등급이면 자동으로 장애(Incident) 티켓 생성!
        if ("CRITICAL".equalsIgnoreCase(event.getSeverity())) {
            Incident autoIncident = new Incident();
            autoIncident.setTitle("[자동 접수] " + event.getSource() + " 알람: " + event.getMessage());
            autoIncident.setDescription("모니터링 시스템에 의해 자동 생성된 장애입니다.\n발생 노드: " + event.getNode());
            autoIncident.setPriority(Priority.CRITICAL);
            autoIncident.setStatus(TicketStatus.OPEN);

            // 🌟 에러의 원인 해결! (요청자와 고객사 필수 값 세팅)
            autoIncident.setRequesterName("System (Auto)");
            autoIncident.setRequesterId("SYSTEM_001");

            // 기본 고객사(ID 1번)를 DB에서 찾아서 넣어줍니다.
            companyRepository.findById(1L).ifPresent(autoIncident::setCompany);

            // DB에 장애 티켓 저장
            Incident savedIncident = incidentRepository.save(autoIncident);

            // 이벤트에 생성된 장애 티켓 ID 기록 및 상태 업데이트
            event.setRelatedIncidentId(savedIncident.getId());
            event.setStatus("PROCESSED");
            log.info("CRITICAL 이벤트 감지! 자동 장애 티켓 생성 완료 (ID: {})", savedIncident.getId());
        }

        // 이벤트 로그 저장
        eventRepository.save(event);

        return ResponseEntity.ok("Event received successfully");
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAll());
    }
}