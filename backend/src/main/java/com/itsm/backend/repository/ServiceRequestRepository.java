package com.itsm.backend.repository;

import com.itsm.backend.domain.ServiceRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    // 특정 고객사에서 요청한 서비스 목록 조회
    Page<ServiceRequest> findByCompanyId(Long companyId, Pageable pageable);

    // 특정 승인 상태(예: PENDING)인 요청만 조회
    Page<ServiceRequest> findByApprovalStatus(String approvalStatus, Pageable pageable);

    // 요청자명으로 정확히 분리된 검색
    Page<ServiceRequest> findByRequesterNameContaining(String requesterName, Pageable pageable);

    // 🌟 승인 대기 건수를 세기 위한 메서드 추가
    long countByApprovalStatus(String approvalStatus);
}
