package com.itsm.backend.dto;

import lombok.Getter;
import lombok.Setter;
//import java.time.LocalDate;

@Getter
@Setter
public class ServiceRequestDto {
    private Long catalogId;       // 어떤 서비스를 신청했는지
    private String title;         // 요청 제목
    private String description;   // 상세 사유 및 내용
    private String requesterName; // 신청자 이름
    private String targetDate;    // 희망 완료일 (String으로 받아 처리)
}
