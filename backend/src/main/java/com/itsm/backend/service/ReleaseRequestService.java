package com.itsm.backend.service;

import com.itsm.backend.domain.Company;
import com.itsm.backend.domain.ReleaseRequest;
import com.itsm.backend.dto.ReleaseRequestDto;
import com.itsm.backend.repository.CompanyRepository;
import com.itsm.backend.repository.ReleaseRequestRepository;
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
public class ReleaseRequestService {

    private final ReleaseRequestRepository releaseRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public Page<ReleaseRequest> getReleases(int page, int size, String sort, String direction,
                                            String releaseType, String title, String managerName, String status) {
        Sort.Direction dir = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));

        return releaseRepository.searchReleases(releaseType, title, managerName, status, pageable);
    }

    @Transactional
    public ReleaseRequest createRelease(ReleaseRequestDto dto) {
        ReleaseRequest record = new ReleaseRequest();
        updateEntityFromDto(record, dto);
        if (record.getStatus() == null) record.setStatus("PLANNING"); // 기본 상태

        return releaseRepository.save(record);
    }

    @Transactional
    public ReleaseRequest updateRelease(Long id, ReleaseRequestDto dto) {
        ReleaseRequest record = releaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배포 기록입니다."));

        updateEntityFromDto(record, dto);
        return releaseRepository.save(record);
    }

    @Transactional
    public void deleteRelease(Long id) {
        if (!releaseRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 배포 기록입니다.");
        }
        releaseRepository.deleteById(id);
    }

    // 🌟 DTO -> Entity 변환 및 안전한 날짜 파싱 공통 메서드
    private void updateEntityFromDto(ReleaseRequest record, ReleaseRequestDto dto) {
        record.setVersion(dto.getVersion());
        record.setTitle(dto.getTitle());
        record.setDescription(dto.getDescription());
        if (dto.getStatus() != null) record.setStatus(dto.getStatus());
        record.setReleaseType(dto.getReleaseType());
        record.setManagerName(dto.getManagerName());

        // 날짜 문자열 변환 로직 (T가 있으면 LocalDateTime, 없으면 LocalDate로 파싱 후 시간 추가)
        record.setTargetDate(parseDateString(dto.getTargetDate()));
        record.setActualDate(parseDateString(dto.getActualDate()));

        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고객사입니다."));
            record.setCompany(company);
        }
    }

    private LocalDateTime parseDateString(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) return null;
        if (dateStr.contains("T")) {
            return LocalDateTime.parse(dateStr);
        }
        return LocalDate.parse(dateStr).atStartOfDay();
    }
}