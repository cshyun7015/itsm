package com.itsm.backend.controller;

import com.itsm.backend.domain.ReleaseRecord;
import com.itsm.backend.repository.ReleaseRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/releases")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ReleaseController {

    private final ReleaseRecordRepository releaseRepository;

    @GetMapping
    public ResponseEntity<List<ReleaseRecord>> getAllReleases() {
        return ResponseEntity.ok(releaseRepository.findAll());
    }
}