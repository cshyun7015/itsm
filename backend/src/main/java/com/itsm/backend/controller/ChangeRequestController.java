package com.itsm.backend.controller;

import com.itsm.backend.domain.ChangeRequest;
import com.itsm.backend.dto.ChangeRequestDto;
import com.itsm.backend.service.ChangeRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/changes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ChangeRequestController {

    private final ChangeRequestService changeRequestService;

    // 1. 조회 (페이징 + 다중 검색)
    @GetMapping
    public ResponseEntity<Page<ChangeRequest>> getChanges(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String requesterName,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(changeRequestService.getChanges(page, size, sort, direction, riskLevel, title, requesterName, status));
    }

    // 2. 생성
    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ChangeRequest> createChange(@RequestBody ChangeRequestDto dto) {
        return ResponseEntity.ok(changeRequestService.createChange(dto));
    }

    // 3. 수정
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ChangeRequest> updateChange(@PathVariable Long id, @RequestBody ChangeRequestDto dto) {
        try {
            return ResponseEntity.ok(changeRequestService.updateChange(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 4. 삭제
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<Void> deleteChange(@PathVariable Long id) {
        try {
            changeRequestService.deleteChange(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}