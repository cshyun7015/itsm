package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class SlaPolicy {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String policyName;
    private String targetType;
    private String targetPriority;
    private Integer targetTime;
    private String description;
    private String status = "ACTIVE";
    private LocalDateTime createdAt = LocalDateTime.now();
}