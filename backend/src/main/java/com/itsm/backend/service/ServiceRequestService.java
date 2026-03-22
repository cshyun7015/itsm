package com.itsm.backend.service;

import com.itsm.backend.domain.*;
import com.itsm.backend.dto.ServiceRequestDto;
import com.itsm.backend.repository.CompanyRepository;
import com.itsm.backend.repository.ServiceCatalogRepository;
import com.itsm.backend.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ServiceRequestService {
    private final ServiceRequestRepository requestRepository;
    private final ServiceCatalogRepository catalogRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public ServiceRequest createRequest(ServiceRequestDto dto) {
        ServiceCatalog catalog = catalogRepository.findById(dto.getCatalogId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카탈로그입니다."));

        Company company = companyRepository.findById(1L).get();

        ServiceRequest request = new ServiceRequest();
        request.setCatalog(catalog);
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setRequesterName(dto.getRequesterName());
        request.setRequesterId("EMP-9999");
        request.setCompany(company);
        request.setStatus(TicketStatus.OPEN);
        request.setApprovalStatus("PENDING");
        request.setTargetDeliveryDate(LocalDate.parse(dto.getTargetDate()));

        return requestRepository.save(request);
    }

    // 🌟 서버 사이드 페이징 및 정렬 처리
    @Transactional(readOnly = true)
    public Page<ServiceRequest> getRequests(int page, int size, String sort, String direction, String requesterName) {
        Sort.Direction dir = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));

        if (requesterName != null && !requesterName.isEmpty()) {
            return requestRepository.findByRequesterNameContaining(requesterName, pageable);
        }
        return requestRepository.findAll(pageable); // 기본 findAll도 페이징 지원
    }

    @Transactional
    public ServiceRequest updateApproval(Long id, String approvalStatus, String comment) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 요청입니다."));

        request.setApprovalStatus(approvalStatus);

        if ("APPROVED".equals(approvalStatus)) {
            request.setStatus(TicketStatus.IN_PROGRESS);
        } else if ("REJECTED".equals(approvalStatus)) {
            request.setStatus(TicketStatus.CANCELED);
        }
        return requestRepository.save(request);
    }

    // 🌟 수동 수정 로직 추가
    @Transactional
    public ServiceRequest updateRequest(Long id, ServiceRequestDto dto) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 요청입니다."));

        // 카탈로그 변경 처리
        if (dto.getCatalogId() != null) {
            ServiceCatalog catalog = catalogRepository.findById(dto.getCatalogId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 카탈로그입니다."));
            request.setCatalog(catalog);
        }

        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setRequesterName(dto.getRequesterName());

        if (dto.getTargetDate() != null) {
            request.setTargetDeliveryDate(LocalDate.parse(dto.getTargetDate()));
        }

        // 상태값 강제 변경 로직 (수동 수정 시)
        if (dto.getApprovalStatus() != null) {
            request.setApprovalStatus(dto.getApprovalStatus());
            if ("APPROVED".equals(dto.getApprovalStatus())) {
                request.setStatus(TicketStatus.IN_PROGRESS);
            } else if ("REJECTED".equals(dto.getApprovalStatus())) {
                request.setStatus(TicketStatus.CANCELED);
            } else if ("PENDING".equals(dto.getApprovalStatus())) {
                request.setStatus(TicketStatus.OPEN);
            }
        }

        return requestRepository.save(request);
    }

    // 🌟 수동 삭제 로직 추가
    @Transactional
    public void deleteRequest(Long id) {
        if (!requestRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 요청입니다.");
        }
        requestRepository.deleteById(id);
    }
}