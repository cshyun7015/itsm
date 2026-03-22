package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class SlaMetric {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String metricName;
    private String unit;
    private Double targetValue;
    private Double actualValue;
    private String measurementPeriod;
    private LocalDateTime lastMeasuredAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "policy_id")
    private SlaPolicy policy;
}