package com.itsm.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProblemDto {
    private String title;
    private String description;
    private String status;
    private String priority;
    private String rootCause;
    private String workaround;
    private String managerName;
    // 🌟 프론트엔드에서 넘어오는 "YYYY-MM-DD" 포맷을 받기 위해 String으로 변경
    private String targetResolutionDate;
    private Long companyId; // 고객사 연동을 위한 ID
}