package com.itsm.backend.repository;

import com.itsm.backend.domain.SlaMetric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SlaMetricRepository extends JpaRepository<SlaMetric, Long> {
    @Query("SELECT m FROM SlaMetric m WHERE " +
            "(:metricName IS NULL OR :metricName = '' OR m.metricName LIKE %:metricName%)")
    Page<SlaMetric> searchMetrics(@Param("metricName") String metricName, Pageable pageable);
}