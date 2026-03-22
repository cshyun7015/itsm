package com.itsm.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class ChangeRequestDto {
    private String title;
    private String reason;
    private String riskLevel;
    private String plan;
    private String backoutPlan;
    private String requesterName;
    private String status;
    private LocalDateTime scheduledAt;
}