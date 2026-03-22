// backend/src/test/java/com/itsm/backend/service/SlaPolicyServiceTest.java
package com.itsm.backend.service;

import com.itsm.backend.domain.SlaPolicy;
import com.itsm.backend.dto.SlaPolicyDto;
import com.itsm.backend.repository.SlaPolicyRepository;
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
class SlaPolicyServiceTest {
    @Mock private SlaPolicyRepository repo;
    @InjectMocks private SlaPolicyService service;

    @Test void createPolicyTest() {
        SlaPolicyDto dto = new SlaPolicyDto(); dto.setPolicyName("장애 해결 SLA"); dto.setTargetType("INCIDENT");
        SlaPolicy p = new SlaPolicy(); p.setId(1L); p.setPolicyName("장애 해결 SLA");
        when(repo.save(any())).thenReturn(p);
        SlaPolicy res = service.createPolicy(dto);
        assertEquals("장애 해결 SLA", res.getPolicyName());
    }

    @Test void updatePolicyTest() {
        SlaPolicy existing = new SlaPolicy(); existing.setPolicyName("Old Name");
        SlaPolicyDto dto = new SlaPolicyDto(); dto.setPolicyName("New Name");
        when(repo.findById(1L)).thenReturn(Optional.of(existing));
        when(repo.save(any())).thenReturn(existing);
        SlaPolicy res = service.updatePolicy(1L, dto);
        assertEquals("New Name", res.getPolicyName());
    }
}