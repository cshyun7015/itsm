package com.itsm.backend.repository;

import com.itsm.backend.domain.SlaPolicy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SlaPolicyRepository extends JpaRepository<SlaPolicy, Long> {
    @Query("SELECT s FROM SlaPolicy s WHERE " +
            "(:policyName IS NULL OR :policyName = '' OR s.policyName LIKE %:policyName%) AND " +
            "(:targetType IS NULL OR :targetType = '' OR s.targetType = :targetType) AND " +
            "(:status IS NULL OR :status = '' OR s.status = :status)")
    Page<SlaPolicy> searchPolicies(
            @Param("policyName") String policyName,
            @Param("targetType") String targetType,
            @Param("status") String status,
            Pageable pageable);
}