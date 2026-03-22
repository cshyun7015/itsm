package com.itsm.backend.service;

import com.itsm.backend.domain.ConfigurationItem;
import com.itsm.backend.dto.CIDto;
import com.itsm.backend.repository.CIRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CIService {

    private final CIRepository ciRepository;

    @Transactional(readOnly = true)
    public Page<ConfigurationItem> getCIs(int page, int size, String sort, String direction,
                                          String ciType, String ciName, String environment, String ownerName) {
        Sort.Direction dir = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));

        return ciRepository.searchCIs(ciType, ciName, environment, ownerName, pageable);
    }

    @Transactional
    public ConfigurationItem createCI(CIDto dto) {
        ConfigurationItem ci = new ConfigurationItem();
        updateEntityFromDto(ci, dto);
        ci.setCreatedAt(LocalDateTime.now());
        if (ci.getStatus() == null) ci.setStatus("ACTIVE");

        return ciRepository.save(ci);
    }

    @Transactional
    public ConfigurationItem updateCI(Long id, CIDto dto) {
        ConfigurationItem ci = ciRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 구성 항목(CI)입니다."));

        updateEntityFromDto(ci, dto);
        return ciRepository.save(ci);
    }

    @Transactional
    public void deleteCI(Long id) {
        if (!ciRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 구성 항목(CI)입니다.");
        }
        ciRepository.deleteById(id);
    }

    // 🌟 DTO -> Entity 변환 및 안전한 날짜(String -> LocalDateTime) 파싱 공통 메서드
    private void updateEntityFromDto(ConfigurationItem ci, CIDto dto) {
        ci.setCiName(dto.getCiName());
        ci.setCiType(dto.getCiType());
        ci.setIpAddress(dto.getIpAddress());
        ci.setEnvironment(dto.getEnvironment());
        ci.setOwnerName(dto.getOwnerName());
        ci.setDescription(dto.getDescription());
        if (dto.getStatus() != null) ci.setStatus(dto.getStatus());

        if (dto.getLastAuditedAt() != null && !dto.getLastAuditedAt().isEmpty()) {
            if (dto.getLastAuditedAt().contains("T")) {
                ci.setLastAuditedAt(LocalDateTime.parse(dto.getLastAuditedAt()));
            } else {
                ci.setLastAuditedAt(LocalDate.parse(dto.getLastAuditedAt()).atStartOfDay());
            }
        } else {
            ci.setLastAuditedAt(null);
        }
    }
}