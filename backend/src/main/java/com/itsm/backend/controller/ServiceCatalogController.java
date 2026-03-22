package com.itsm.backend.controller;

import com.itsm.backend.domain.ServiceCatalog;
import com.itsm.backend.service.ServiceCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogs")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ServiceCatalogController {
    private final ServiceCatalogService catalogService;

    // 1. 조회: 파라미터에 따라 활성 목록 또는 전체 목록 반환
    @GetMapping
    public ResponseEntity<List<ServiceCatalog>> getCatalogs(@RequestParam(defaultValue = "false") boolean all) {
        if (all) {
            return ResponseEntity.ok(catalogService.getAllCatalogs()); // 관리자용 전체 조회
        }
        return ResponseEntity.ok(catalogService.getActiveCatalogs());  // 사용자용 활성 조회
    }

    // 2. 등록: 담당자/관리자 전용
    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ServiceCatalog> createCatalog(@RequestBody ServiceCatalog catalog) {
        return ResponseEntity.ok(catalogService.createCatalog(catalog));
    }

    // 3. 수정: 담당자/관리자 전용
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ServiceCatalog> updateCatalog(@PathVariable Long id, @RequestBody ServiceCatalog catalog) {
        try {
            return ResponseEntity.ok(catalogService.updateCatalog(id, catalog));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 4. 삭제: 담당자/관리자 전용
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<Void> deleteCatalog(@PathVariable Long id) {
        try {
            catalogService.deleteCatalog(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}