package com.itsm.backend.controller;

import com.itsm.backend.domain.ServiceCatalog;
import com.itsm.backend.service.ServiceCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogs")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class ServiceCatalogController {
    private final ServiceCatalogService catalogService;

    @GetMapping
    public ResponseEntity<List<ServiceCatalog>> getCatalogs() {
        return ResponseEntity.ok(catalogService.getActiveCatalogs());
    }
}
