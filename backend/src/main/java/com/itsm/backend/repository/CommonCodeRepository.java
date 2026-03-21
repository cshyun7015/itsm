package com.itsm.backend.repository;

import com.itsm.backend.domain.CommonCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommonCodeRepository extends JpaRepository<CommonCode, Long> {
    // 특정 그룹의 사용 중인 코드만 프론트엔드 드롭다운용으로 조회할 때 유용합니다.
    List<CommonCode> findByGroupCodeAndUseYn(String groupCode, String useYn);
}
