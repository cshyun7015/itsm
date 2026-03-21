package com.itsm.backend.service;

import com.itsm.backend.domain.TicketStatus;
import com.itsm.backend.dto.DashboardDto;
import com.itsm.backend.repository.CompanyRepository;
import com.itsm.backend.repository.IncidentRepository;
import com.itsm.backend.repository.ServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final IncidentRepository incidentRepository;
    private final ServiceRequestRepository requestRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public DashboardDto getSummary() {
        long open = incidentRepository.countByStatus(TicketStatus.OPEN);
        long inProgress = incidentRepository.countByStatus(TicketStatus.IN_PROGRESS);
        long pending = requestRepository.countByApprovalStatus("PENDING");
        long companies = companyRepository.count();

        return new DashboardDto(open, inProgress, pending, companies);
    }
}
