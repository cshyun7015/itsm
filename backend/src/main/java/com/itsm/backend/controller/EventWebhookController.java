package com.itsm.backend.controller;

import com.itsm.backend.domain.Event;
import com.itsm.backend.domain.Incident;
import com.itsm.backend.domain.Priority;
import com.itsm.backend.domain.TicketStatus;
// 🌟 Company와 CompanyRepository 임포트 추가
//import com.itsm.backend.domain.Company;
import com.itsm.backend.repository.EventRepository;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    // =========================================================================
    // 🌟 2. 새로 추가된 "Grafana 전용" 수신처
    // =========================================================================
    @PostMapping("/grafana")
    @SuppressWarnings("unchecked") // 🌟 컴파일러에게 "이 제네릭 캐스팅은 안전하니 경고를 끄라"고 지시합니다.
    public ResponseEntity<String> receiveGrafanaAlert(@RequestBody Map<String, Object> payload) {
        log.info("📊 [Grafana 알람 수신] Webhook 도착!");

        try {
            // 그라파나는 여러 알람을 'alerts' 배열에 담아서 보냅니다.
            List<Map<String, Object>> alerts = (List<Map<String, Object>>) payload.get("alerts");

            if (alerts != null && !alerts.isEmpty()) {
                for (Map<String, Object> alert : alerts) {
                    String status = (String) alert.get("status"); // "firing"(발생) 또는 "resolved"(해제)

                    // 알람이 발생("firing")했을 때만 처리
                    if ("firing".equals(status)) {
                        Map<String, Object> annotations = (Map<String, Object>) alert.getOrDefault("annotations", Map.of());
                        Map<String, Object> labels = (Map<String, Object>) alert.getOrDefault("labels", Map.of());

                        // 파싱 및 기본값 세팅
                        String summary = (String) annotations.getOrDefault("summary", "시스템 임계치 초과 경고!");
                        String instance = (String) labels.getOrDefault("instance", "unknown-node");
                        // 이 부분이 에러가 났던 곳이죠? 아래와 같이 수정합니다.
                        String severity = labels.getOrDefault("severity", "CRITICAL").toString().toUpperCase();

                        // 우리 시스템의 Event 엔티티 규격에 맞게 변환
                        Event newEvent = new Event();
                        newEvent.setSource("Grafana Alerting");
                        newEvent.setSeverity(severity);
                        newEvent.setMessage(summary);
                        newEvent.setNode(instance);
                        newEvent.setStatus("NEW");

                        // 🌟 핵심: 변환된 Event 객체를 작성해두신 기존 로직으로 던집니다! (코드 재사용의 정석)
                        this.receiveEvent(newEvent);
                    }
                }
            }
            return ResponseEntity.ok("Grafana alert processed successfully");
        } catch (Exception e) {
            log.error("Grafana 알람 파싱 중 오류 발생", e);
            return ResponseEntity.badRequest().body("Failed to parse Grafana payload");
        }
    }

    @GetMapping("/events")
    public ResponseEntity<List<Event>> getAllEvents() {
        return ResponseEntity.ok(eventRepository.findAll());
    }
}