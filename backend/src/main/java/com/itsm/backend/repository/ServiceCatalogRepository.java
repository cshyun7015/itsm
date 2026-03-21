package com.itsm.backend.repository;

import com.itsm.backend.domain.ServiceCatalog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, Long> {
    // 활성화된(사용자가 신청할 수 있는) 카탈로그 목록만 조회
    List<ServiceCatalog> findByIsActiveTrue();

    // 특정 카테고리별로 카탈로그 조회
    List<ServiceCatalog> findByCategoryAndIsActiveTrue(String category);
}
