package com.itsm.backend.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class IncidentHistoryDto {
    private String changedBy;
    private String previousStatus;
    private String newStatus;
    private String updateComment;
    private LocalDateTime createdAt;
}
