package com.itsm.backend.controller;

import com.itsm.backend.domain.SlaPolicy;
import com.itsm.backend.repository.SlaPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.itsm.backend.repository.IncidentRepository; // 🌟 추가
import java.util.Map; // 🌟 추가

@RestController
@RequestMapping("/api/slm")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SlmController {

    private final SlaPolicyRepository slaPolicyRepository;
    private final IncidentRepository incidentRepository; // 🌟 추가

    @GetMapping("/policies")
    public ResponseEntity<List<SlaPolicy>> getAllPolicies() {
        return ResponseEntity.ok(slaPolicyRepository.findAll());
    }

    // 🌟 대시보드용 SLA 통계 API 추가
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSlaStatistics() {
        long breachedCount = incidentRepository.countBySlaBreached(true);
        long compliantCount = incidentRepository.countBySlaBreached(false);
        long totalCount = breachedCount + compliantCount;

        // 준수율 계산 (소수점 1자리까지)
        double complianceRate = totalCount == 0 ? 100.0 : (double) compliantCount / totalCount * 100;

        return ResponseEntity.ok(Map.of(
                "total", totalCount,
                "breached", breachedCount,
                "compliant", compliantCount,
                "complianceRate", String.format("%.1f", complianceRate)
        ));
    }
}