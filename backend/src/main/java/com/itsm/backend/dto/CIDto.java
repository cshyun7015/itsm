package com.itsm.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CIDto {
    private String ciName;
    private String ciType;
    private String ipAddress;
    private String environment;
    private String ownerName;
    private String status;
    private String description;

    // 🌟 프론트엔드에서 넘어오는 날짜 문자열(YYYY-MM-DD)을 안전하게 받기 위함
    private String lastAuditedAt;
}