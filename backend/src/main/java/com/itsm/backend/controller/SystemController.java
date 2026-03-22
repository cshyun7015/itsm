package com.itsm.backend.controller;

import com.itsm.backend.domain.*;
import com.itsm.backend.dto.*;
import com.itsm.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@PreAuthorize("hasRole('ADMIN')") // 🌟 시스템 관리 메뉴의 모든 CRUD는 관리자 전용
public class SystemController {

    private final UserService userService;
    private final CompanyService companyService;
    private final CommonCodeService commonCodeService;

    // === 1. 사용자(User) API ===
    @GetMapping("/users")
    public ResponseEntity<Page<User>> getUsers(
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="id") String sort, @RequestParam(defaultValue="desc") String dir,
            @RequestParam(required=false) String username, @RequestParam(required=false) String name,
            @RequestParam(required=false) String department, @RequestParam(required=false) Role role) {
        return ResponseEntity.ok(userService.getUsers(page, size, sort, dir, username, name, department, role));
    }
    @PostMapping("/users")
    public ResponseEntity<User> createUser(@RequestBody UserDto dto) { return ResponseEntity.ok(userService.createUser(dto)); }
    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserDto dto) { return ResponseEntity.ok(userService.updateUser(id, dto)); }
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) { userService.deleteUser(id); return ResponseEntity.ok().build(); }

    // === 2. 고객사(Company) API ===
    @GetMapping("/companies")
    public ResponseEntity<Page<Company>> getCompanies(
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="id") String sort, @RequestParam(defaultValue="desc") String dir,
            @RequestParam(required=false) String name, @RequestParam(required=false) String code) {
        return ResponseEntity.ok(companyService.getCompanies(page, size, sort, dir, name, code));
    }
    @PostMapping("/companies")
    public ResponseEntity<Company> createCompany(@RequestBody CompanyDto dto) { return ResponseEntity.ok(companyService.createCompany(dto)); }
    @PutMapping("/companies/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody CompanyDto dto) { return ResponseEntity.ok(companyService.updateCompany(id, dto)); }
    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) { companyService.deleteCompany(id); return ResponseEntity.ok().build(); }

    // === 3. 공통 코드(CommonCode) API ===
    @GetMapping("/codes")
    public ResponseEntity<Page<CommonCode>> getCodes(
            @RequestParam(defaultValue="0") int page, @RequestParam(defaultValue="10") int size,
            @RequestParam(defaultValue="id") String sort, @RequestParam(defaultValue="desc") String dir,
            @RequestParam(required=false) String groupCode, @RequestParam(required=false) String codeName) {
        return ResponseEntity.ok(commonCodeService.getCodes(page, size, sort, dir, groupCode, codeName));
    }
    @PostMapping("/codes")
    public ResponseEntity<CommonCode> createCode(@RequestBody CommonCodeDto dto) { return ResponseEntity.ok(commonCodeService.createCode(dto)); }
    @PutMapping("/codes/{id}")
    public ResponseEntity<CommonCode> updateCode(@PathVariable Long id, @RequestBody CommonCodeDto dto) { return ResponseEntity.ok(commonCodeService.updateCode(id, dto)); }
    @DeleteMapping("/codes/{id}")
    public ResponseEntity<Void> deleteCode(@PathVariable Long id) { commonCodeService.deleteCode(id); return ResponseEntity.ok().build(); }
}