package com.itsm.backend.controller;

import com.itsm.backend.domain.ConfigurationItem;
import com.itsm.backend.repository.CIRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cmdb")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CIController {

    private final CIRepository ciRepository;

    @GetMapping
    public ResponseEntity<List<ConfigurationItem>> getAllCIs() {
        return ResponseEntity.ok(ciRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<ConfigurationItem> createCI(@RequestBody ConfigurationItem ci) {
        if (ci.getStatus() == null) {
            ci.setStatus("ACTIVE"); // 기본 상태
        }
        return ResponseEntity.ok(ciRepository.save(ci));
    }
}
