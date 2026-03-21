package com.itsm.backend.controller;

import com.itsm.backend.domain.ServiceRequest;
import com.itsm.backend.dto.ServiceRequestDto;
import com.itsm.backend.service.ServiceRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-requests")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ServiceRequestController {
    private final ServiceRequestService requestService;

    @PostMapping
    public ResponseEntity<ServiceRequest> createRequest(@RequestBody ServiceRequestDto dto) {
        return ResponseEntity.ok(requestService.createRequest(dto));
    }

    @GetMapping
    public ResponseEntity<List<ServiceRequest>> getRequests(
            @RequestParam(required = false) String requesterName) {
        if (requesterName != null && !requesterName.isEmpty()) {
            return ResponseEntity.ok(requestService.searchRequests(requesterName));
        }
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    @PutMapping("/{id}/approval")
    public ResponseEntity<ServiceRequest> approveRequest(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String comment) {
        return ResponseEntity.ok(requestService.updateApproval(id, status, comment));
    }
}
