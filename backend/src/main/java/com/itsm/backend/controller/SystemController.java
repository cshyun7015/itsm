package com.itsm.backend.controller;

import com.itsm.backend.domain.CommonCode;
import com.itsm.backend.domain.Company;
import com.itsm.backend.domain.User;
import com.itsm.backend.repository.CommonCodeRepository;
import com.itsm.backend.repository.CompanyRepository;
import com.itsm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SystemController {

    private final CommonCodeRepository commonCodeRepository;
    private final UserRepository userRepository;       // 🌟 추가
    private final CompanyRepository companyRepository; // 🌟 추가

    // 공통 코드 전체 목록 조회 (시스템 관리 탭용)
    @GetMapping("/codes")
    public ResponseEntity<List<CommonCode>> getAllCodes() {
        return ResponseEntity.ok(commonCodeRepository.findAll());
    }

    // 🌟 사용자 목록 조회 API
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 🌟 고객사 목록 조회 API
    @GetMapping("/companies")
    public ResponseEntity<List<Company>> getAllCompanies() {
        return ResponseEntity.ok(companyRepository.findAll());
    }
}
