package com.itsm.backend.service;

import com.itsm.backend.domain.ChangeRequest;
import com.itsm.backend.dto.ChangeRequestDto;
import com.itsm.backend.repository.ChangeRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChangeRequestService {

    private final ChangeRequestRepository changeRequestRepository;

    // 1. 다중 검색 및 페이징 조회
    @Transactional(readOnly = true)
    public Page<ChangeRequest> getChanges(int page, int size, String sort, String direction,
                                          String riskLevel, String title, String requesterName, String status) {
        Sort.Direction dir = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));

        return changeRequestRepository.searchChanges(riskLevel, title, requesterName, status, pageable);
    }

    // 2. 생성 (Create)
    @Transactional
    public ChangeRequest createChange(ChangeRequestDto dto) {
        ChangeRequest cr = new ChangeRequest();
        cr.setTitle(dto.getTitle());
        cr.setReason(dto.getReason());
        cr.setRiskLevel(dto.getRiskLevel());
        cr.setPlan(dto.getPlan());
        cr.setBackoutPlan(dto.getBackoutPlan());
        cr.setRequesterName(dto.getRequesterName());
        cr.setStatus(dto.getStatus() != null ? dto.getStatus() : "CAB_APPROVAL");
        cr.setScheduledAt(dto.getScheduledAt());
        cr.setCreatedAt(LocalDateTime.now());

        return changeRequestRepository.save(cr);
    }

    // 3. 수정 (Update)
    @Transactional
    public ChangeRequest updateChange(Long id, ChangeRequestDto dto) {
        ChangeRequest cr = changeRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 변경 요청입니다."));

        cr.setTitle(dto.getTitle());
        cr.setReason(dto.getReason());
        cr.setRiskLevel(dto.getRiskLevel());
        cr.setPlan(dto.getPlan());
        cr.setBackoutPlan(dto.getBackoutPlan());
        cr.setRequesterName(dto.getRequesterName());
        if (dto.getStatus() != null) cr.setStatus(dto.getStatus());
        cr.setScheduledAt(dto.getScheduledAt());

        return changeRequestRepository.save(cr);
    }

    // 4. 삭제 (Delete)
    @Transactional
    public void deleteChange(Long id) {
        if (!changeRequestRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 변경 요청입니다.");
        }
        changeRequestRepository.deleteById(id);
    }
}