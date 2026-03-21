package com.itsm.backend.repository;

import com.itsm.backend.domain.Incident;
import com.itsm.backend.domain.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // 1. 특정 고객사(Company ID)에서 발생한 모든 인시던트 조회
    List<Incident> findByCompanyId(Long companyId);

    // 2. 특정 고객사의 '진행 중'이거나 '오픈'된 인시던트만 필터링
    List<Incident> findByCompanyIdAndStatus(Long companyId, TicketStatus status);

    // 3. [검색 명확화] '고객사명'으로 검색할 때 (연관관계 엔티티의 필드 탐색)
    List<Incident> findByCompany_NameContaining(String companyName);

    // 4. [검색 명확화] '요청자명'으로 검색할 때 (Incident 테이블 자체 필드)
    List<Incident> findByRequesterNameContaining(String requesterName);

    // 🌟 대시보드 통계를 위한 카운트 메서드 추가
    long countByStatus(TicketStatus status);
}
