package com.itsm.backend.controller;

import com.itsm.backend.domain.ReleaseRequest;
import com.itsm.backend.dto.ReleaseRequestDto;
import com.itsm.backend.service.ReleaseRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/releases")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ReleaseController {

    private final ReleaseRequestService releaseService;

    // 1. 조회 (페이징 + 다중 검색)
    @GetMapping
    public ResponseEntity<Page<ReleaseRequest>> getReleases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String releaseType,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String managerName,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(releaseService.getReleases(page, size, sort, direction, releaseType, title, managerName, status));
    }

    // 2. 생성
    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ReleaseRequest> createRelease(@RequestBody ReleaseRequestDto dto) {
        return ResponseEntity.ok(releaseService.createRelease(dto));
    }

    // 3. 수정
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ReleaseRequest> updateRelease(@PathVariable Long id, @RequestBody ReleaseRequestDto dto) {
        try {
            return ResponseEntity.ok(releaseService.updateRelease(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 4. 삭제
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')") // 배포 기록 삭제는 관리자만 허용
    public ResponseEntity<Void> deleteRelease(@PathVariable Long id) {
        try {
            releaseService.deleteRelease(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}