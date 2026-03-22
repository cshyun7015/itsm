package com.itsm.backend.controller;

import com.itsm.backend.domain.Incident;
import com.itsm.backend.domain.Priority;
import com.itsm.backend.domain.TicketStatus;
import com.itsm.backend.dto.IncidentHistoryDto;
import com.itsm.backend.dto.IncidentRequestDto;
import com.itsm.backend.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    // 🌟 페이징, 정렬, 검색이 모두 통합된 만능 조회 API
    @GetMapping
    public ResponseEntity<Page<Incident>> getIncidents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false, defaultValue = "requester") String searchType,
            @RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(incidentService.getIncidents(page, size, sort, direction, searchType, keyword));
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody IncidentRequestDto requestDto) {
        Incident createdIncident = incidentService.createIncident(requestDto);
        return ResponseEntity.ok(createdIncident);
    }

    // 🌟 상태 및 중요도 부분 업데이트 (담당자/관리자 전용)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<Incident> updateStatus(
            @PathVariable Long id,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String comment,
            @RequestParam String updaterId) {

        Incident updatedIncident = incidentService.updateIncidentPartial(id, status, priority, comment, updaterId);
        return ResponseEntity.ok(updatedIncident);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<IncidentHistoryDto>> getIncidentHistory(@PathVariable Long id) {
        List<IncidentHistoryDto> history = incidentService.getIncidentHistory(id);
        return ResponseEntity.ok(history);
    }

    // 🌟 삭제(Delete) 기능은 컴플라이언스를 위해 제공하지 않습니다!
}