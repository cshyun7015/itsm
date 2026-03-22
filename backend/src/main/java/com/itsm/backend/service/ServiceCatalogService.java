package com.itsm.backend.service;

import com.itsm.backend.domain.ServiceCatalog;
import com.itsm.backend.dto.ServiceCatalogDto;
import com.itsm.backend.repository.ServiceCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceCatalogService {
    private final ServiceCatalogRepository catalogRepository;

    // 1. 사용자용 전체 활성 목록 조회 (쇼핑몰 형태)
    @Transactional(readOnly = true)
    public List<ServiceCatalog> getActiveCatalogs() {
        return catalogRepository.findByIsActiveTrueOrderByIdDesc();
    }

    // 2. 관리자용 페이징 및 다중 검색 조회
    @Transactional(readOnly = true)
    public Page<ServiceCatalog> getCatalogsPaged(int page, int size, String sort, String dir,
                                                 String category, String name, Boolean isActive) {
        Sort.Direction direction = Sort.Direction.fromString(dir);
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort));
        return catalogRepository.searchCatalogs(category, name, isActive, pageable);
    }

    @Transactional
    public ServiceCatalog createCatalog(ServiceCatalogDto dto) {
        ServiceCatalog catalog = new ServiceCatalog();
        updateEntityFromDto(catalog, dto);
        if (catalog.getIsActive() == null) catalog.setIsActive(true);
        if (catalog.getApprovalRequired() == null) catalog.setApprovalRequired(false);

        return catalogRepository.save(catalog);
    }

    @Transactional
    public ServiceCatalog updateCatalog(Long id, ServiceCatalogDto dto) {
        ServiceCatalog catalog = catalogRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 서비스 카탈로그입니다."));
        updateEntityFromDto(catalog, dto);
        return catalogRepository.save(catalog);
    }

    @Transactional
    public void deleteCatalog(Long id) {
        catalogRepository.deleteById(id);
    }

    private void updateEntityFromDto(ServiceCatalog entity, ServiceCatalogDto dto) {
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory());
        entity.setEstimatedDays(dto.getEstimatedDays());
        entity.setIsActive(dto.getIsActive());
        entity.setApprovalRequired(dto.getApprovalRequired());
        entity.setCost(dto.getCost());
        entity.setTargetAudience(dto.getTargetAudience());
        entity.setIconCode(dto.getIconCode());
    }
}