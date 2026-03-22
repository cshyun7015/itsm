package com.itsm.backend.repository;

import com.itsm.backend.domain.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCode(String code);

    @Query("SELECT c FROM Company c WHERE " +
            "(:name IS NULL OR :name = '' OR c.name LIKE %:name%) AND " +
            "(:code IS NULL OR :code = '' OR c.code LIKE %:code%)")
    Page<Company> searchCompanies(@Param("name") String name, @Param("code") String code, Pageable pageable);
}