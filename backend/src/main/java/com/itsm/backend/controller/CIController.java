package com.itsm.backend.controller;

import com.itsm.backend.domain.ConfigurationItem;
import com.itsm.backend.dto.CIDto;
import com.itsm.backend.service.CIService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cmdb") // 기존 프론트 API 경로와 맞춤
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CIController {

    private final CIService ciService;

    // 1. 조회 (페이징 + 다중 검색)
    @GetMapping
    public ResponseEntity<Page<ConfigurationItem>> getCIs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String ciType,
            @RequestParam(required = false) String ciName,
            @RequestParam(required = false) String environment,
            @RequestParam(required = false) String ownerName) {

        return ResponseEntity.ok(ciService.getCIs(page, size, sort, direction, ciType, ciName, environment, ownerName));
    }

    // 2. 생성
    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ConfigurationItem> createCI(@RequestBody CIDto dto) {
        return ResponseEntity.ok(ciService.createCI(dto));
    }

    // 3. 수정
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ConfigurationItem> updateCI(@PathVariable Long id, @RequestBody CIDto dto) {
        try {
            return ResponseEntity.ok(ciService.updateCI(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 4. 삭제 (자산 삭제는 관리자 전용)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCI(@PathVariable Long id) {
        try {
            ciService.deleteCI(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}