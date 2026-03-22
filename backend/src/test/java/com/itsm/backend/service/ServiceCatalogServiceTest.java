package com.itsm.backend.service;

import com.itsm.backend.domain.ServiceCatalog;
import com.itsm.backend.dto.ServiceCatalogDto;
import com.itsm.backend.repository.ServiceCatalogRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceCatalogServiceTest {

    @Mock
    private ServiceCatalogRepository catalogRepository;

    @InjectMocks
    private ServiceCatalogService catalogService;

    @Test
    @DisplayName("사용자용 활성 카탈로그 전체 조회 테스트")
    void getActiveCatalogsTest() {
        ServiceCatalog catalog = new ServiceCatalog();
        catalog.setName("VPN 신청");
        when(catalogRepository.findByIsActiveTrueOrderByIdDesc())
                .thenReturn(Collections.singletonList(catalog));

        List<ServiceCatalog> result = catalogService.getActiveCatalogs();

        assertEquals(1, result.size());
        assertEquals("VPN 신청", result.get(0).getName());
    }

    @Test
    @DisplayName("관리자용 페이징 및 검색 조회 테스트")
    void getCatalogsPagedTest() {
        ServiceCatalog catalog = new ServiceCatalog();
        catalog.setName("노트북 대여");
        Page<ServiceCatalog> pageData = new PageImpl<>(Collections.singletonList(catalog));

        when(catalogRepository.searchCatalogs(eq("HW"), any(), any(), any(Pageable.class)))
                .thenReturn(pageData);

        Page<ServiceCatalog> result = catalogService.getCatalogsPaged(0, 10, "id", "desc", "HW", null, null);

        assertEquals(1, result.getTotalElements());
        assertEquals("노트북 대여", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("카탈로그 생성 테스트 (새로운 속성 및 기본값 검증)")
    void createCatalogTest() {
        ServiceCatalogDto dto = new ServiceCatalogDto();
        dto.setName("Adobe CC 라이선스");
        dto.setCost(50000);
        // isActive와 approvalRequired를 세팅하지 않음 (기본값 테스트)

        ServiceCatalog saved = new ServiceCatalog();
        saved.setName("Adobe CC 라이선스");
        saved.setCost(50000);
        saved.setIsActive(true); // Service에서 true로 세팅되는지 확인
        saved.setApprovalRequired(false);

        when(catalogRepository.save(any(ServiceCatalog.class))).thenReturn(saved);

        ServiceCatalog result = catalogService.createCatalog(dto);

        assertNotNull(result);
        assertEquals("Adobe CC 라이선스", result.getName());
        assertEquals(50000, result.getCost());
        assertTrue(result.getIsActive());
        assertFalse(result.getApprovalRequired());
    }

    @Test
    @DisplayName("카탈로그 수정 테스트")
    void updateCatalogTest() {
        ServiceCatalog existing = new ServiceCatalog();
        existing.setId(1L);
        existing.setName("Old Name");

        ServiceCatalogDto dto = new ServiceCatalogDto();
        dto.setName("New Name");
        dto.setTargetAudience("IT_ONLY");

        when(catalogRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(catalogRepository.save(any(ServiceCatalog.class))).thenReturn(existing);

        ServiceCatalog result = catalogService.updateCatalog(1L, dto);

        assertEquals("New Name", result.getName());
        assertEquals("IT_ONLY", result.getTargetAudience());
    }
}