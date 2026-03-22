package com.itsm.backend.repository;

import com.itsm.backend.domain.Incident;
import com.itsm.backend.domain.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByCompanyId(Long companyId);
    List<Incident> findByCompanyIdAndStatus(Long companyId, TicketStatus status);
    long countByStatus(TicketStatus status);
    long countBySlaBreached(boolean slaBreached);

    // 🌟 페이징이 지원되는 조건별 검색 메서드 (기존 List 반환을 Page 반환으로 변경)
    Page<Incident> findByRequesterNameContaining(String requesterName, Pageable pageable);
    Page<Incident> findByCompany_NameContaining(String companyName, Pageable pageable);

    // 🌟 대시보드 차트용: 상태별 인시던트 수 집계
    @org.springframework.data.jpa.repository.Query("SELECT i.status, COUNT(i) FROM Incident i GROUP BY i.status")
    List<Object[]> countByStatusGroup();

    // 🌟 대시보드 차트용: 우선순위별 인시던트 수 집계
    @org.springframework.data.jpa.repository.Query("SELECT i.priority, COUNT(i) FROM Incident i GROUP BY i.priority")
    List<Object[]> countByPriorityGroup();

    // 🌟 대시보드용: 최근 발생한 인시던트 5건 조회
    List<Incident> findTop5ByOrderByCreatedAtDesc();
}