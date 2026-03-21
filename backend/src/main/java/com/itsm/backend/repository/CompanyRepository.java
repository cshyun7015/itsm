package com.itsm.backend.repository;

import com.itsm.backend.domain.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    // 고객사 코드로 정확히 조회하는 메서드
    Optional<Company> findByCode(String code);

    // 고객사 이름이 포함된(Like 검색) 데이터를 찾는 메서드
    List<Company> findByNameContaining(String name);
}
