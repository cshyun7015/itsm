package com.itsm.backend.service;

import com.itsm.backend.domain.CommonCode;
import com.itsm.backend.dto.CommonCodeDto;
import com.itsm.backend.repository.CommonCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommonCodeService {
    private final CommonCodeRepository codeRepository;

    @Transactional(readOnly = true)
    public Page<CommonCode> getCodes(int page, int size, String sort, String dir, String group, String name) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(dir), sort));
        return codeRepository.searchCodes(group, name, pageable);
    }

    @Transactional
    public CommonCode createCode(CommonCodeDto dto) {
        CommonCode c = new CommonCode();
        updateEntity(c, dto);
        return codeRepository.save(c);
    }

    @Transactional
    public CommonCode updateCode(Long id, CommonCodeDto dto) {
        CommonCode c = codeRepository.findById(id).orElseThrow();
        updateEntity(c, dto);
        return codeRepository.save(c);
    }

    // 🌟 추가: 셀렉트 박스용 서비스 메서드
    @Transactional(readOnly = true)
    public List<CommonCode> getActiveCodesForDropdown(String groupCode) {
        return codeRepository.findByGroupCodeAndUseYnOrderByDisplayOrderAsc(groupCode, "Y");
    }

    @Transactional
    public void deleteCode(Long id) { codeRepository.deleteById(id); }

    private void updateEntity(CommonCode c, CommonCodeDto d) {
        c.setGroupCode(d.getGroupCode()); c.setCodeValue(d.getCodeValue());
        c.setCodeName(d.getCodeName()); c.setDescription(d.getDescription());
        c.setUseYn(d.getUseYn() != null ? d.getUseYn() : "Y");
    }
}