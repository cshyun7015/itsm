package com.itsm.backend.repository;

import com.itsm.backend.domain.ChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long> {

    // 상태별 변경 요청 목록 조회 (DRAFT, CAB_APPROVAL, SCHEDULED 등)
    List<ChangeRequest> findByStatus(String status);

    // 요청자별 변경 요청 목록 조회
    List<ChangeRequest> findByRequesterNameContaining(String requesterName);

    // 대시보드 통계를 위한 카운트 (필요 시)
    long countByStatus(String status);
}
