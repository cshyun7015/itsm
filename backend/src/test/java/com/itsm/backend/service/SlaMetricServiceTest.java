// backend/src/test/java/com/itsm/backend/service/SlaMetricServiceTest.java
package com.itsm.backend.service;

import com.itsm.backend.domain.*;
import com.itsm.backend.dto.SlaMetricDto;
import com.itsm.backend.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SlaMetricServiceTest {
    @Mock private SlaMetricRepository metricRepo;
    @Mock private SlaPolicyRepository policyRepo;
    @InjectMocks private SlaMetricService service;

    @Test void createMetricTest() {
        SlaMetricDto dto = new SlaMetricDto(); dto.setMetricName("준수율"); dto.setPolicyId(1L);
        SlaPolicy policy = new SlaPolicy(); policy.setId(1L);
        SlaMetric metric = new SlaMetric(); metric.setMetricName("준수율");
        when(policyRepo.findById(1L)).thenReturn(Optional.of(policy));
        when(metricRepo.save(any())).thenReturn(metric);
        SlaMetric res = service.createMetric(dto);
        assertEquals("준수율", res.getMetricName());
    }
}