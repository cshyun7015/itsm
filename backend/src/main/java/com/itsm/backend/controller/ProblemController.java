package com.itsm.backend.controller;

import com.itsm.backend.domain.Problem;
import com.itsm.backend.dto.ProblemDto;
import com.itsm.backend.service.ProblemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ProblemController {

    private final ProblemService problemService;

    // 1. 조회 (페이징, 정렬, 검색 통합)
    @GetMapping
    public ResponseEntity<Page<Problem>> getProblems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String title) {

        return ResponseEntity.ok(problemService.getProblems(page, size, sort, direction, status, title));
    }

    // 2. 등록 (담당자/관리자 전용)
    @PostMapping
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<Problem> createProblem(@RequestBody ProblemDto dto) {
        return ResponseEntity.ok(problemService.createProblem(dto));
    }

    // 3. 수정 (담당자/관리자 전용)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<Problem> updateProblem(@PathVariable Long id, @RequestBody ProblemDto dto) {
        try {
            return ResponseEntity.ok(problemService.updateProblem(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 4. 삭제 (담당자/관리자 전용)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT', 'ADMIN')")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        try {
            problemService.deleteProblem(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}