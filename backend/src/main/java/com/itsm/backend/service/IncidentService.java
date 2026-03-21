package com.itsm.backend.service;

import com.itsm.backend.domain.Company;
import com.itsm.backend.domain.Incident;
import com.itsm.backend.domain.Priority;
import com.itsm.backend.domain.TicketStatus;
import com.itsm.backend.dto.IncidentRequestDto;
import com.itsm.backend.repository.CompanyRepository;
import com.itsm.backend.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.itsm.backend.domain.IncidentHistory;
import com.itsm.backend.repository.IncidentHistoryRepository;

import com.itsm.backend.dto.IncidentHistoryDto;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final CompanyRepository companyRepository;
    // 🌟 History Repository 추가
    private final IncidentHistoryRepository historyRepository;

    @Transactional
    public Incident createIncident(IncidentRequestDto dto) {
        // 1. 고객사 정보 조회 (없으면 예외 발생)
        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고객사입니다."));

        // 2. Builder 대신 기본 생성자(new)와 Setter를 사용하여 객체 생성
        Incident incident = new Incident();
        incident.setTitle(dto.getTitle()); // 부모 클래스의 필드
        incident.setDescription(dto.getDescription()); // 부모 클래스의 필드
        incident.setRequesterName(dto.getRequesterName()); // 부모 클래스의 필드

        // 🌟 이 줄을 추가해 주세요! (필수 값인 ID에 임시 사번 부여)
        incident.setRequesterId("EMP-9999");

        incident.setPriority(Priority.valueOf(dto.getPriority())); // 부모 클래스의 필드
        incident.setStatus(TicketStatus.OPEN); // 초기 상태 고정

        // 3. 연관관계 매핑 (고객사 셋팅)
        incident.setCompany(company);

        return incidentRepository.save(incident);
    }

    @Transactional(readOnly = true)
    public List<Incident> searchIncidents(String searchType, String keyword) {
        if ("requester".equalsIgnoreCase(searchType)) {
            return incidentRepository.findByRequesterNameContaining(keyword);
        } else if ("company".equalsIgnoreCase(searchType)) {
            return incidentRepository.findByCompany_NameContaining(keyword);
        }

        return incidentRepository.findAll();
    }

    // 🌟 티켓 상태 업데이트 및 이력 기록 로직
    @Transactional
    public Incident updateIncidentStatus(Long incidentId, String newStatusStr, String updateComment, String updaterId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 인시던트입니다."));

        TicketStatus oldStatus = incident.getStatus();
        TicketStatus newStatus = TicketStatus.valueOf(newStatusStr.toUpperCase());

        // 상태가 실제로 변경되었을 때만 처리
        if (oldStatus != newStatus) {
            incident.setStatus(newStatus);

            // 해결(RESOLVED) 상태로 변경 시 복구 시간 기록
            if (newStatus == TicketStatus.RESOLVED) {
                incident.setRestoredAt(java.time.LocalDateTime.now());
            }

            // 변경 이력(Audit Trail) 저장
            IncidentHistory history = new IncidentHistory();
            history.setIncident(incident);
            history.setChangedBy(updaterId);
            history.setPreviousStatus(oldStatus);
            history.setNewStatus(newStatus);
            history.setUpdateComment(updateComment);

            historyRepository.save(history);
        }

        return incident; // 변경 감지(Dirty Checking)에 의해 incident 테이블은 자동 업데이트 됨
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