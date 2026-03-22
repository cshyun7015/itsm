package com.itsm.backend.repository;

import com.itsm.backend.domain.ChangeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long> {

    // 🌟 4가지 조건(위험도, 제목, 요청자, 상태) 동적 다중 검색 및 페이징
    @Query("SELECT c FROM ChangeRequest c WHERE " +
            "(:riskLevel IS NULL OR :riskLevel = '' OR c.riskLevel = :riskLevel) AND " +
            "(:title IS NULL OR :title = '' OR c.title LIKE %:title%) AND " +
            "(:requesterName IS NULL OR :requesterName = '' OR c.requesterName LIKE %:requesterName%) AND " +
            "(:status IS NULL OR :status = '' OR c.status = :status)")
    Page<ChangeRequest> searchChanges(
            @Param("riskLevel") String riskLevel,
            @Param("title") String title,
            @Param("requesterName") String requesterName,
            @Param("status") String status,
            Pageable pageable
    );
}