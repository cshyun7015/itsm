package com.itsm.backend.controller;

import com.itsm.backend.domain.ServiceRequest;
import com.itsm.backend.dto.ServiceRequestDto;
import com.itsm.backend.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/service-requests")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ServiceRequestController {
    private final ServiceRequestService requestService;

    // 등록: 누구나(USER, AGENT, ADMIN) 서비스 카탈로그에서 신청 가능
    @PostMapping
    public ResponseEntity<ServiceRequest> createRequest(@RequestBody ServiceRequestDto dto) {
        return ResponseEntity.ok(requestService.createRequest(dto));
    }

    // 조회: 누구나 볼 수 있으나 페이징+정렬 적용
    @GetMapping
    public ResponseEntity<Page<ServiceRequest>> getRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String requesterName) {
        return ResponseEntity.ok(requestService.getRequests(page, size, sort, direction, requesterName));
    }

    // 🌟 승인/반려: 담당자(AGENT) 또는 관리자(ADMIN)만 가능하도록 권한 제어!
    @PutMapping("/{id}/approval")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ServiceRequest> approveRequest(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String comment) {
        return ResponseEntity.ok(requestService.updateApproval(id, status, comment));
    }

    // 🌟 수동 수정 (담당자/관리자 전용)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ServiceRequest> updateRequest(@PathVariable Long id, @RequestBody ServiceRequestDto dto) {
        try {
            return ResponseEntity.ok(requestService.updateRequest(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🌟 수동 삭제 (담당자/관리자 전용)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        try {
            requestService.deleteRequest(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}