package com.itsm.backend.controller;

import com.itsm.backend.domain.ServiceCatalog;
import com.itsm.backend.dto.ServiceCatalogDto;
import com.itsm.backend.service.ServiceCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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

    // 1. [일반 사용자용] 활성화된 카탈로그 전체 조회 (쇼핑몰 UI용)
    @GetMapping("/active")
    public ResponseEntity<List<ServiceCatalog>> getActiveCatalogs() {
        return ResponseEntity.ok(catalogService.getActiveCatalogs());
    }

    // 2. [관리자용] 페이징 및 다중 검색 리스트 조회
    @GetMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<Page<ServiceCatalog>> getCatalogsPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "desc") String dir,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Boolean isActive) {

        return ResponseEntity.ok(catalogService.getCatalogsPaged(page, size, sort, dir, category, name, isActive));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ServiceCatalog> createCatalog(@RequestBody ServiceCatalogDto dto) {
        return ResponseEntity.ok(catalogService.createCatalog(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<ServiceCatalog> updateCatalog(@PathVariable Long id, @RequestBody ServiceCatalogDto dto) {
        return ResponseEntity.ok(catalogService.updateCatalog(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCatalog(@PathVariable Long id) {
        catalogService.deleteCatalog(id);
        return ResponseEntity.ok().build();
    }
}