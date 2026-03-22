package com.itsm.backend.repository;

import com.itsm.backend.domain.ConfigurationItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CIRepository extends JpaRepository<ConfigurationItem, Long> {

    // 🌟 분류(ciType), 자산명(ciName), 환경(environment), 담당자(ownerName) 동적 다중 검색
    @Query("SELECT c FROM ConfigurationItem c WHERE " +
            "(:ciType IS NULL OR :ciType = '' OR c.ciType = :ciType) AND " +
            "(:ciName IS NULL OR :ciName = '' OR c.ciName LIKE %:ciName%) AND " +
            "(:environment IS NULL OR :environment = '' OR c.environment = :environment) AND " +
            "(:ownerName IS NULL OR :ownerName = '' OR c.ownerName LIKE %:ownerName%)")
    Page<ConfigurationItem> searchCIs(
            @Param("ciType") String ciType,
            @Param("ciName") String ciName,
            @Param("environment") String environment,
            @Param("ownerName") String ownerName,
            Pageable pageable
    );
}