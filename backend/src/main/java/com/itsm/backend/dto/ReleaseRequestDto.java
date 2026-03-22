package com.itsm.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReleaseRequestDto {
    private String version;
    private String title;
    private String description;
    private String status;
    private String releaseType;
    private String managerName;

    // 🌟 프론트엔드에서 문자열로 넘어오는 날짜를 안전하게 받기 위함
    private String targetDate;
    private String actualDate;

    private Long companyId;
}