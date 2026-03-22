package com.itsm.backend.service;

import com.itsm.backend.domain.ReleaseRequest;
import com.itsm.backend.dto.ReleaseRequestDto;
import com.itsm.backend.repository.ReleaseRequestRepository;
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
class ReleaseRequestServiceTest {

    @Mock
    private ReleaseRequestRepository releaseRepository;

    @InjectMocks
    private ReleaseRequestService releaseService;

    @Test
    @DisplayName("배포 기록 생성 테스트 (날짜 변환 포함)")
    void createReleaseTest() {
        // Given
        ReleaseRequestDto dto = new ReleaseRequestDto();
        dto.setTitle("v1.5.0 정기 배포");
        dto.setVersion("v1.5.0");
        dto.setTargetDate("2026-03-25"); // 프론트에서 온 문자열 날짜

        ReleaseRequest savedRecord = new ReleaseRequest();
        savedRecord.setId(1L);
        savedRecord.setTitle("v1.5.0 정기 배포");
        savedRecord.setStatus("PLANNING");
        savedRecord.setTargetDate(LocalDateTime.of(2026, 3, 25, 0, 0));

        when(releaseRepository.save(any(ReleaseRequest.class))).thenReturn(savedRecord);

        // When
        ReleaseRequest result = releaseService.createRelease(dto);

        // Then
        assertNotNull(result);
        assertEquals("v1.5.0 정기 배포", result.getTitle());
        assertEquals("PLANNING", result.getStatus());
        assertNotNull(result.getTargetDate());
    }

    @Test
    @DisplayName("배포 기록 다중 검색 및 페이징 테스트")
    void getReleasesTest() {
        // Given
        ReleaseRequest record = new ReleaseRequest();
        record.setId(1L);
        record.setTitle("긴급 패치");
        Page<ReleaseRequest> pageData = new PageImpl<>(Collections.singletonList(record));

        when(releaseRepository.searchReleases(eq("EMERGENCY"), any(), any(), any(), any(Pageable.class)))
                .thenReturn(pageData);

        // When
        Page<ReleaseRequest> result = releaseService.getReleases(0, 10, "id", "desc", "EMERGENCY", null, null, null);

        // Then
        assertEquals(1, result.getTotalElements());
        assertEquals("긴급 패치", result.getContent().get(0).getTitle());
    }

    @Test
    @DisplayName("배포 기록 수정 테스트")
    void updateReleaseTest() {
        // Given
        ReleaseRequest existingRecord = new ReleaseRequest();
        existingRecord.setId(1L);
        existingRecord.setStatus("PLANNING");

        ReleaseRequestDto dto = new ReleaseRequestDto();
        dto.setStatus("COMPLETED");

        when(releaseRepository.findById(1L)).thenReturn(Optional.of(existingRecord));
        when(releaseRepository.save(any(ReleaseRequest.class))).thenReturn(existingRecord);

        // When
        ReleaseRequest result = releaseService.updateRelease(1L, dto);

        // Then
        assertEquals("COMPLETED", result.getStatus());
    }

    @Test
    @DisplayName("배포 기록 삭제 테스트")
    void deleteReleaseTest() {
        // Given
        when(releaseRepository.existsById(1L)).thenReturn(true);

        // When
        releaseService.deleteRelease(1L);

        // Then
        verify(releaseRepository, times(1)).deleteById(1L);
    }
}