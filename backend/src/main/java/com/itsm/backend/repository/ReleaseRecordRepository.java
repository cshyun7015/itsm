package com.itsm.backend.repository;

import com.itsm.backend.domain.ReleaseRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReleaseRecordRepository extends JpaRepository<ReleaseRecord, Long> {
}