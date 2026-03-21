package com.itsm.backend.controller;

import com.itsm.backend.domain.Incident;
import com.itsm.backend.dto.IncidentRequestDto;
import com.itsm.backend.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.itsm.backend.dto.IncidentHistoryDto;

@RestController
@RequestMapping("/api/incidents")
@CrossOrigin(origins = "http://localhost:3000") // React 연동 허용
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;

    // 인시던트 생성 API (POST /api/incidents)
    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody IncidentRequestDto requestDto) {
        Incident createdIncident = incidentService.createIncident(requestDto);
        return ResponseEntity.ok(createdIncident);
    }

    // 인시던트 검색 API (GET /api/incidents/search?searchType=...&keyword=...)
    @GetMapping("/search")
    public ResponseEntity<List<Incident>> searchIncidents(
            @RequestParam String searchType,
            @RequestParam String keyword) {

        // 프론트엔드에서 전달한 searchType(requester 또는 company)에 따라 완전히 분리된 결과를 반환합니다.
        List<Incident> incidents = incidentService.searchIncidents(searchType, keyword);
        return ResponseEntity.ok(incidents);
    }

    // 인시던트 상태 업데이트 API
    @PutMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String comment,
            @RequestParam String updaterId) { // 임시로 updaterId를 쿼리 파라미터로 받음

        Incident updatedIncident = incidentService.updateIncidentStatus(id, status, comment, updaterId);
        return ResponseEntity.ok(updatedIncident);
    }

    // 특정 티켓의 변경 이력 조회 API
    @GetMapping("/{id}/history")
    public ResponseEntity<List<IncidentHistoryDto>> getIncidentHistory(@PathVariable Long id) {
        List<IncidentHistoryDto> history = incidentService.getIncidentHistory(id);
        return ResponseEntity.ok(history);
    }

}
