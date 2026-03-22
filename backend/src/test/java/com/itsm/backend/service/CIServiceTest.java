package com.itsm.backend.service;

import com.itsm.backend.domain.ConfigurationItem;
import com.itsm.backend.dto.CIDto;
import com.itsm.backend.repository.CIRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CIServiceTest {

    @Mock
    private CIRepository ciRepository;

    @InjectMocks
    private CIService ciService;

    @Test
    @DisplayName("구성 항목(CI) 생성 테스트 (날짜 변환 포함)")
    void createCITest() {
        // Given
        CIDto dto = new CIDto();
        dto.setCiName("DB-SERVER-01");
        dto.setCiType("SERVER");
        dto.setLastAuditedAt("2026-03-25"); // 프론트엔드 형식

        ConfigurationItem ci = new ConfigurationItem();
        ci.setId(1L);
        ci.setCiName("DB-SERVER-01");
        ci.setStatus("ACTIVE");
        ci.setLastAuditedAt(LocalDateTime.of(2026, 3, 25, 0, 0));

        when(ciRepository.save(any(ConfigurationItem.class))).thenReturn(ci);

        // When
        ConfigurationItem result = ciService.createCI(dto);

        // Then
        assertNotNull(result);
        assertEquals("DB-SERVER-01", result.getCiName());
        assertEquals("ACTIVE", result.getStatus());
        assertNotNull(result.getLastAuditedAt());
    }

    @Test
    @DisplayName("구성 항목(CI) 다중 검색 및 페이징 테스트")
    void getCIsTest() {
        // Given
        ConfigurationItem ci = new ConfigurationItem();
        ci.setId(1L);
        ci.setCiName("WEB-SERVER-01");
        Page<ConfigurationItem> pageData = new PageImpl<>(Collections.singletonList(ci));

        // ciType, ciName, environment, ownerName
        when(ciRepository.searchCIs(eq("SERVER"), eq("WEB"), any(), any(), any(Pageable.class)))
                .thenReturn(pageData);

        // When
        Page<ConfigurationItem> result = ciService.getCIs(0, 10, "id", "desc", "SERVER", "WEB", null, null);

        // Then
        assertEquals(1, result.getTotalElements());
        assertEquals("WEB-SERVER-01", result.getContent().get(0).getCiName());
    }

    @Test
    @DisplayName("구성 항목(CI) 수정 테스트")
    void updateCITest() {
        // Given
        ConfigurationItem existingCI = new ConfigurationItem();
        existingCI.setId(1L);
        existingCI.setCiName("OLD-SERVER");
        existingCI.setStatus("ACTIVE");

        CIDto dto = new CIDto();
        dto.setCiName("NEW-SERVER");
        dto.setStatus("IN_MAINTENANCE");

        when(ciRepository.findById(1L)).thenReturn(Optional.of(existingCI));
        when(ciRepository.save(any(ConfigurationItem.class))).thenReturn(existingCI);

        // When
        ConfigurationItem result = ciService.updateCI(1L, dto);

        // Then
        assertEquals("NEW-SERVER", result.getCiName());
        assertEquals("IN_MAINTENANCE", result.getStatus());
    }

    @Test
    @DisplayName("구성 항목(CI) 삭제 테스트")
    void deleteCITest() {
        // Given
        when(ciRepository.existsById(1L)).thenReturn(true);

        // When
        ciService.deleteCI(1L);

        // Then
        verify(ciRepository, times(1)).deleteById(1L);
    }
}