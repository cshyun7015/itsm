package com.itsm.backend.repository;

import com.itsm.backend.domain.Problem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    // 🌟 상태(status)와 제목(title) 모두 검색 가능한 동적 쿼리 (값이 없으면 전체 검색)
    @Query("SELECT p FROM Problem p WHERE " +
            "(:status IS NULL OR :status = '' OR p.status = :status) AND " +
            "(:title IS NULL OR :title = '' OR p.title LIKE %:title%)")
    Page<Problem> searchProblems(
            @Param("status") String status,
            @Param("title") String title,
            Pageable pageable
    );
}