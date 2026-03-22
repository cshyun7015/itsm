package com.itsm.backend.service;

import com.itsm.backend.domain.*;
import com.itsm.backend.dto.IncidentHistoryDto;
import com.itsm.backend.dto.IncidentRequestDto;
import com.itsm.backend.repository.CompanyRepository;
import com.itsm.backend.repository.IncidentHistoryRepository;
import com.itsm.backend.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final CompanyRepository companyRepository;
    private final IncidentHistoryRepository historyRepository;

    // 🌟 서버 사이드 페이징, 정렬, 검색 통합 로직
    @Transactional(readOnly = true)
    public Page<Incident> getIncidents(int page, int size, String sort, String direction, String searchType, String keyword) {
        Sort.Direction dir = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));

        if (keyword != null && !keyword.isEmpty()) {
            if ("requester".equals(searchType)) {
                return incidentRepository.findByRequesterNameContaining(keyword, pageable);
            } else if ("company".equals(searchType)) {
                return incidentRepository.findByCompany_NameContaining(keyword, pageable);
            }
        }
        return incidentRepository.findAll(pageable);
    }

    @Transactional
    public Incident createIncident(IncidentRequestDto dto) {
        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고객사입니다."));

        Incident incident = new Incident();
        incident.setTitle(dto.getTitle());
        incident.setDescription(dto.getDescription());
        incident.setRequesterName(dto.getRequesterName());
        incident.setPriority(Priority.valueOf(dto.getPriority()));
        incident.setCompany(company);
        incident.setStatus(TicketStatus.OPEN);
        incident.setCiId(dto.getCiId());     // 추가된 자산 ID
        incident.setCiName(dto.getCiName()); // 추가된 자산명

        return incidentRepository.save(incident);
    }

    // 🌟 제목, 내용 등은 수정 불가. 상태, 우선순위, 코멘트 등만 수정 가능 (부분 수정)
    @Transactional
    public Incident updateIncidentPartial(Long id, TicketStatus newStatus, Priority newPriority, String comment, String updaterId) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 티켓입니다."));

        TicketStatus oldStatus = incident.getStatus();

        // 허용된 필드만 업데이트
        if (newStatus != null) {
            incident.setStatus(newStatus);
            if (newStatus == TicketStatus.RESOLVED) {
                incident.setRestoredAt(java.time.LocalDateTime.now());
            }
        }
        if (newPriority != null) {
            incident.setPriority(newPriority);
        }

        Incident savedIncident = incidentRepository.save(incident);

        // 변경 이력(Audit Trail) 남기기
        IncidentHistory history = new IncidentHistory();
        history.setIncident(savedIncident);
        history.setChangedBy(updaterId);
        history.setPreviousStatus(oldStatus);
        history.setNewStatus(savedIncident.getStatus());
        history.setUpdateComment(comment);
        historyRepository.save(history);

        return savedIncident;
    }

    @Transactional(readOnly = true)
    public List<IncidentHistoryDto> getIncidentHistory(Long incidentId) {
        return historyRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId)
                .stream()
                .map(history -> {
                    IncidentHistoryDto dto = new IncidentHistoryDto();
                    dto.setChangedBy(history.getChangedBy());
                    dto.setPreviousStatus(history.getPreviousStatus() != null ? history.getPreviousStatus().name() : "-");
                    dto.setNewStatus(history.getNewStatus().name());
                    dto.setUpdateComment(history.getUpdateComment());
                    dto.setCreatedAt(history.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}