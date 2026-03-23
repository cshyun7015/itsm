package com.itsm.backend.controller;

import com.itsm.backend.domain.CommonCode;
import com.itsm.backend.service.CommonCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dropdown")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CommonCodeDropdownController {

    private final CommonCodeService commonCodeService;

    // 🌟 카탈로그 카테고리, 신청 대상자 그룹 등 셀렉트 박스 데이터 조회용 (권한 제한 없음)
    @GetMapping("/common-codes/{groupCode}")
    public ResponseEntity<List<CommonCode>> getDropdownCodes(@PathVariable String groupCode) {
        return ResponseEntity.ok(commonCodeService.getActiveCodesForDropdown(groupCode));
    }
}