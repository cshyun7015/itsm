package com.itsm.backend.service;

import com.itsm.backend.domain.SlaMetric;
import com.itsm.backend.domain.SlaPolicy;
import com.itsm.backend.dto.SlaMetricDto;
import com.itsm.backend.repository.SlaMetricRepository;
import com.itsm.backend.repository.SlaPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SlaMetricService {
    private final SlaMetricRepository metricRepository;
    private final SlaPolicyRepository policyRepository;

    @Transactional(readOnly = true)
    public Page<SlaMetric> getMetrics(int page, int size, String sort, String dir, String name) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(dir), sort));
        return metricRepository.searchMetrics(name, pageable);
    }

    @Transactional
    public SlaMetric createMetric(SlaMetricDto dto) {
        SlaMetric metric = new SlaMetric();
        updateEntity(metric, dto);
        return metricRepository.save(metric);
    }

    @Transactional
    public SlaMetric updateMetric(Long id, SlaMetricDto dto) {
        SlaMetric metric = metricRepository.findById(id).orElseThrow();
        updateEntity(metric, dto);
        metric.setLastMeasuredAt(LocalDateTime.now());
        return metricRepository.save(metric);
    }

    @Transactional
    public void deleteMetric(Long id) { metricRepository.deleteById(id); }

    private void updateEntity(SlaMetric m, SlaMetricDto d) {
        m.setMetricName(d.getMetricName()); m.setUnit(d.getUnit());
        m.setTargetValue(d.getTargetValue()); m.setActualValue(d.getActualValue());
        m.setMeasurementPeriod(d.getMeasurementPeriod());
        if (d.getPolicyId() != null) {
            SlaPolicy policy = policyRepository.findById(d.getPolicyId()).orElseThrow();
            m.setPolicy(policy);
        }
    }
}