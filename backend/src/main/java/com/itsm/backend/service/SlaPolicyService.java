package com.itsm.backend.service;

import com.itsm.backend.domain.SlaPolicy;
import com.itsm.backend.dto.SlaPolicyDto;
import com.itsm.backend.repository.SlaPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SlaPolicyService {
    private final SlaPolicyRepository policyRepository;

    @Transactional(readOnly = true)
    public Page<SlaPolicy> getPolicies(int page, int size, String sort, String dir, String name, String type, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(dir), sort));
        return policyRepository.searchPolicies(name, type, status, pageable);
    }

    @Transactional
    public SlaPolicy createPolicy(SlaPolicyDto dto) {
        SlaPolicy policy = new SlaPolicy();
        updateEntity(policy, dto);
        return policyRepository.save(policy);
    }

    @Transactional
    public SlaPolicy updatePolicy(Long id, SlaPolicyDto dto) {
        SlaPolicy policy = policyRepository.findById(id).orElseThrow();
        updateEntity(policy, dto);
        return policyRepository.save(policy);
    }

    @Transactional
    public void deletePolicy(Long id) {
        policyRepository.deleteById(id);
    }

    private void updateEntity(SlaPolicy p, SlaPolicyDto d) {
        p.setPolicyName(d.getPolicyName()); p.setTargetType(d.getTargetType());
        p.setTargetPriority(d.getTargetPriority()); p.setTargetTime(d.getTargetTime());
        p.setDescription(d.getDescription()); if(d.getStatus() != null) p.setStatus(d.getStatus());
    }
}