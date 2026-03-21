package com.itsm.backend.service;

import com.itsm.backend.domain.*;
import com.itsm.backend.dto.ServiceRequestDto;
import com.itsm.backend.repository.CompanyRepository;
import com.itsm.backend.repository.ServiceCatalogRepository;
import com.itsm.backend.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

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

        // 테스트용 고객사(ID:1) 강제 세팅
        Company company = companyRepository.findById(1L).get();

        ServiceRequest request = new ServiceRequest();
        request.setCatalog(catalog);
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setRequesterName(dto.getRequesterName());
        request.setRequesterId("EMP-9999"); // 임시 사번
        request.setCompany(company);
        request.setStatus(TicketStatus.OPEN);
        request.setApprovalStatus("PENDING"); // 기본값: 승인 대기
        request.setTargetDeliveryDate(LocalDate.parse(dto.getTargetDate()));

        return requestRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<ServiceRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<ServiceRequest> searchRequests(String requesterName) {
        return requestRepository.findByRequesterNameContaining(requesterName);
    }

    @Transactional
    public ServiceRequest updateApproval(Long id, String approvalStatus, String comment) {
        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 요청입니다."));

        request.setApprovalStatus(approvalStatus); // APPROVED 또는 REJECTED

        if ("APPROVED".equals(approvalStatus)) {
            // 승인 시: 티켓 상태를 '처리 중'으로 변경
            request.setStatus(TicketStatus.IN_PROGRESS);
        } else if ("REJECTED".equals(approvalStatus)) {
            // 반려 시: 티켓 상태를 '취소됨'으로 변경
            request.setStatus(TicketStatus.CANCELED);
        }

        // 실제 운영 환경에서는 여기에 '승인 코멘트'를 저장하는 로직이나
        // 신청자에게 메일을 발송하는 로직이 추가됩니다.

        return request;
    }
}
