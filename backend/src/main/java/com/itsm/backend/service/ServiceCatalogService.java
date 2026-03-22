package com.itsm.backend.service;

import com.itsm.backend.domain.ServiceCatalog;
import com.itsm.backend.repository.ServiceCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceCatalogService {
    private final ServiceCatalogRepository catalogRepository;

    @Transactional(readOnly = true)
    public List<ServiceCatalog> getActiveCatalogs() {
        return catalogRepository.findByIsActiveTrue();
    }

    // 🌟 관리자용: 모든 카탈로그 조회 (비활성 포함)
    @Transactional(readOnly = true)
    public List<ServiceCatalog> getAllCatalogs() {
        return catalogRepository.findAllByOrderByIdDesc();
    }

    // 🌟 카탈로그 생성
    @Transactional
    public ServiceCatalog createCatalog(ServiceCatalog catalog) {
        if (catalog.getIsActive() == null) {
            catalog.setIsActive(true); // 기본값 활성화
        }
        return catalogRepository.save(catalog);
    }

    // 🌟 카탈로그 수정
    @Transactional
    public ServiceCatalog updateCatalog(Long id, ServiceCatalog updatedCatalog) {
        return catalogRepository.findById(id).map(catalog -> {
            catalog.setName(updatedCatalog.getName());
            catalog.setDescription(updatedCatalog.getDescription());
            catalog.setCategory(updatedCatalog.getCategory());
            catalog.setEstimatedDays(updatedCatalog.getEstimatedDays());
            catalog.setIsActive(updatedCatalog.getIsActive());
            return catalogRepository.save(catalog);
        }).orElseThrow(() -> new IllegalArgumentException("카탈로그를 찾을 수 없습니다. ID: " + id));
    }

    // 🌟 카탈로그 삭제
    @Transactional
    public void deleteCatalog(Long id) {
        if (!catalogRepository.existsById(id)) {
            throw new IllegalArgumentException("카탈로그를 찾을 수 없습니다. ID: " + id);
        }
        catalogRepository.deleteById(id);
    }
}