package com.itsm.backend.controller;

import com.itsm.backend.domain.ChangeRequest;
import com.itsm.backend.repository.ChangeRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/changes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // 프론트엔드 포트 허용
public class ChangeRequestController {

    private final ChangeRequestRepository changeRequestRepository;

    // 1. 모든 변경 요청 목록 조회
    @GetMapping
    public ResponseEntity<List<ChangeRequest>> getAllChanges() {
        return ResponseEntity.ok(changeRequestRepository.findAll());
    }

    // 2. 신규 변경 요청(CR) 생성
    @PostMapping
    public ResponseEntity<ChangeRequest> createChange(@RequestBody ChangeRequest changeRequest) {
        // 초기 상태 설정
        if (changeRequest.getStatus() == null) {
            changeRequest.setStatus("CAB_APPROVAL"); // 생성 시 바로 심의 대기 상태로 설정
        }
        return ResponseEntity.ok(changeRequestRepository.save(changeRequest));
    }

    // 3. 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ChangeRequest> getChange(@PathVariable Long id) {
        return changeRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 4. 상태 업데이트 (승인, 반려, 일정 확정 등)
    @PatchMapping("/{id}/status")
    public ResponseEntity<ChangeRequest> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        return changeRequestRepository.findById(id)
                .map(cr -> {
                    cr.setStatus(status);
                    return ResponseEntity.ok(changeRequestRepository.save(cr));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
