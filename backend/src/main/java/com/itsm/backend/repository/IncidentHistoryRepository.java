package com.itsm.backend.repository;

import com.itsm.backend.domain.IncidentHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, Long> {
    // 특정 티켓의 모든 변경 이력을 시간순으로 조회
    List<IncidentHistory> findByIncidentIdOrderByCreatedAtAsc(Long incidentId);
}
