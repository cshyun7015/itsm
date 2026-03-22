package com.itsm.backend.repository;

import com.itsm.backend.domain.ServiceCatalog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceCatalogRepository extends JpaRepository<ServiceCatalog, Long> {

    // 사용자 쇼핑몰 화면용 (활성화된 것만 전체 조회)
    List<ServiceCatalog> findByIsActiveTrueOrderByIdDesc();

    // 🌟 쿼리 수정: name 또는 description에 키워드가 포함된 경우 검색
    @Query("SELECT s FROM ServiceCatalog s WHERE " +
            "(:category IS NULL OR :category = '' OR s.category = :category) AND " +
            "(:name IS NULL OR :name = '' OR s.name LIKE %:name% OR s.description LIKE %:name%) AND " +
            "(:isActive IS NULL OR s.isActive = :isActive)")
    Page<ServiceCatalog> searchCatalogs(
            @Param("category") String category,
            @Param("name") String name, // 이 파라미터가 명칭+설명 통합 검색어로 쓰입니다.
            @Param("isActive") Boolean isActive,
            Pageable pageable
    );
}