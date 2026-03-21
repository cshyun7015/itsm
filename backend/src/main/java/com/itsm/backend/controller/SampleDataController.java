package com.itsm.backend.controller;

import com.itsm.backend.service.SampleDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dummy")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SampleDataController {

    private final SampleDataService sampleDataService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateData() {
        sampleDataService.generateDummyData();
        return ResponseEntity.ok("각 테이블에 100개의 샘플 데이터가 성공적으로 생성되었습니다!");
    }
}
