package com.itsm.backend.repository;

import com.itsm.backend.domain.ReleaseRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReleaseRequestRepository extends JpaRepository<ReleaseRequest, Long> {

    // 🌟 유형, 명칭, 담당자, 상태 다중 검색 쿼리
    @Query("SELECT r FROM ReleaseRequest r WHERE " +
            "(:releaseType IS NULL OR :releaseType = '' OR r.releaseType = :releaseType) AND " +
            "(:title IS NULL OR :title = '' OR r.title LIKE %:title%) AND " +
            "(:managerName IS NULL OR :managerName = '' OR r.managerName LIKE %:managerName%) AND " +
            "(:status IS NULL OR :status = '' OR r.status = :status)")
    Page<ReleaseRequest> searchReleases(
            @Param("releaseType") String releaseType,
            @Param("title") String title,
            @Param("managerName") String managerName,
            @Param("status") String status,
            Pageable pageable
    );
}