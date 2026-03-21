package com.itsm.backend.repository;

import com.itsm.backend.domain.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    // 특정 고객사에서 요청한 서비스 목록 조회
    List<ServiceRequest> findByCompanyId(Long companyId);

    // 특정 승인 상태(예: PENDING)인 요청만 조회
    List<ServiceRequest> findByApprovalStatus(String approvalStatus);

    // 요청자명으로 정확히 분리된 검색
    List<ServiceRequest> findByRequesterNameContaining(String requesterName);

    // 🌟 승인 대기 건수를 세기 위한 메서드 추가
    long countByApprovalStatus(String approvalStatus);
}
