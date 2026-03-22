package com.itsm.backend.service;

import com.itsm.backend.domain.ChangeRequest;
import com.itsm.backend.dto.ChangeRequestDto;
import com.itsm.backend.repository.ChangeRequestRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChangeRequestServiceTest {

    @Mock
    private ChangeRequestRepository changeRequestRepository;

    @InjectMocks
    private ChangeRequestService changeRequestService;

    @Test
    @DisplayName("변경 요청(CR) 생성 테스트")
    void createChangeTest() {
        // Given
        ChangeRequestDto dto = new ChangeRequestDto();
        dto.setTitle("DB 서버 패치");
        dto.setRiskLevel("HIGH");

        ChangeRequest savedEntity = new ChangeRequest();
        savedEntity.setId(1L);
        savedEntity.setTitle("DB 서버 패치");
        savedEntity.setStatus("CAB_APPROVAL"); // 기본값

        when(changeRequestRepository.save(any(ChangeRequest.class))).thenReturn(savedEntity);

        // When
        ChangeRequest result = changeRequestService.createChange(dto);

        // Then
        assertNotNull(result);
        assertEquals("DB 서버 패치", result.getTitle());
        assertEquals("CAB_APPROVAL", result.getStatus());
        verify(changeRequestRepository, times(1)).save(any(ChangeRequest.class));
    }

    @Test
    @DisplayName("변경 요청(CR) 다중 검색 및 페이징 조회 테스트")
    void getChangesTest() {
        // Given
        ChangeRequest cr = new ChangeRequest();
        cr.setId(1L);
        cr.setTitle("DB 서버 패치");
        Page<ChangeRequest> pageData = new PageImpl<>(Collections.singletonList(cr));

        when(changeRequestRepository.searchChanges(eq("HIGH"), any(), any(), any(), any(Pageable.class)))
                .thenReturn(pageData);

        // When
        Page<ChangeRequest> result = changeRequestService.getChanges(0, 10, "id", "desc", "HIGH", null, null, null);

        // Then
        assertEquals(1, result.getTotalElements());
        assertEquals("DB 서버 패치", result.getContent().get(0).getTitle());
    }

    @Test
    @DisplayName("변경 요청(CR) 수정 테스트")
    void updateChangeTest() {
        // Given
        ChangeRequest existingCr = new ChangeRequest();
        existingCr.setId(1L);
        existingCr.setTitle("기존 제목");

        ChangeRequestDto updateDto = new ChangeRequestDto();
        updateDto.setTitle("수정된 제목");
        updateDto.setStatus("SCHEDULED");

        when(changeRequestRepository.findById(1L)).thenReturn(Optional.of(existingCr));
        when(changeRequestRepository.save(any(ChangeRequest.class))).thenReturn(existingCr);

        // When
        ChangeRequest result = changeRequestService.updateChange(1L, updateDto);

        // Then
        assertEquals("수정된 제목", result.getTitle());
        assertEquals("SCHEDULED", result.getStatus());
    }

    @Test
    @DisplayName("변경 요청(CR) 삭제 테스트")
    void deleteChangeTest() {
        // Given
        when(changeRequestRepository.existsById(1L)).thenReturn(true);

        // When
        changeRequestService.deleteChange(1L);

        // Then
        verify(changeRequestRepository, times(1)).deleteById(1L);
    }
}