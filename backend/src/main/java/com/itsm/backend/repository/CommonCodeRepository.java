package com.itsm.backend.repository;

import com.itsm.backend.domain.CommonCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List; // 🌟 임포트 추가

public interface CommonCodeRepository extends JpaRepository<CommonCode, Long> {
    @Query("SELECT c FROM CommonCode c WHERE " +
            "(:groupCode IS NULL OR :groupCode = '' OR c.groupCode = :groupCode) AND " +
            "(:codeName IS NULL OR :codeName = '' OR c.codeName LIKE %:codeName%)")
    Page<CommonCode> searchCodes(@Param("groupCode") String groupCode, @Param("codeName") String codeName, Pageable pageable);

    // 🌟 추가: 일반 사용자 화면(셀렉트 박스)용 목록 조회
    List<CommonCode> findByGroupCodeAndUseYnOrderByDisplayOrderAsc(String groupCode, String useYn);
}