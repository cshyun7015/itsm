// backend/src/main/java/com/itsm/backend/controller/SlmController.java
package com.itsm.backend.controller;

import com.itsm.backend.domain.*;
import com.itsm.backend.dto.*;
import com.itsm.backend.service.*;
import com.itsm.backend.repository.IncidentRepository; // 기존 대시보드 통계용
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/slm")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SlmController {

    private final SlaPolicyService policyService;
    private final SlaMetricService metricService;
    private final IncidentRepository incidentRepository;

    // === 1. 정책 관리 (Policy) ===
    @GetMapping("/policies")
    public ResponseEntity<Page<SlaPolicy>> getPolicies(
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="id") String sort, @RequestParam(defaultValue="desc") String dir,
            @RequestParam(required=false) String name, @RequestParam(required=false) String type, @RequestParam(required=false) String status) {
        return ResponseEntity.ok(policyService.getPolicies(page, size, sort, dir, name, type, status));
    }

    @PostMapping("/policies")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<SlaPolicy> createPolicy(@RequestBody SlaPolicyDto dto) { return ResponseEntity.ok(policyService.createPolicy(dto)); }

    @PutMapping("/policies/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<SlaPolicy> updatePolicy(@PathVariable Long id, @RequestBody SlaPolicyDto dto) { return ResponseEntity.ok(policyService.updatePolicy(id, dto)); }

    @DeleteMapping("/policies/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) { policyService.deletePolicy(id); return ResponseEntity.ok().build(); }

    // === 2. 측정 지표 관리 (Metric) ===
    @GetMapping("/metrics")
    public ResponseEntity<Page<SlaMetric>> getMetrics(
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="id") String sort, @RequestParam(defaultValue="desc") String dir,
            @RequestParam(required=false) String name) {
        return ResponseEntity.ok(metricService.getMetrics(page, size, sort, dir, name));
    }

    @PostMapping("/metrics")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<SlaMetric> createMetric(@RequestBody SlaMetricDto dto) { return ResponseEntity.ok(metricService.createMetric(dto)); }

    @PutMapping("/metrics/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<SlaMetric> updateMetric(@PathVariable Long id, @RequestBody SlaMetricDto dto) { return ResponseEntity.ok(metricService.updateMetric(id, dto)); }

    @DeleteMapping("/metrics/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMetric(@PathVariable Long id) { metricService.deleteMetric(id); return ResponseEntity.ok().build(); }

    // === 3. 기존 대시보드 통계 API 유지 ===
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSlaStatistics() {
        long breachedCount = incidentRepository.countBySlaBreached(true);
        long compliantCount = incidentRepository.countBySlaBreached(false);
        long totalCount = breachedCount + compliantCount;
        double complianceRate = totalCount == 0 ? 100.0 : (double) compliantCount / totalCount * 100;
        return ResponseEntity.ok(Map.of("total", totalCount, "breached", breachedCount, "compliant", compliantCount, "complianceRate", String.format("%.1f", complianceRate)));
    }
}