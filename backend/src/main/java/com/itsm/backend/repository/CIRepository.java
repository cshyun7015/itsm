package com.itsm.backend.repository;

import com.itsm.backend.domain.ConfigurationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CIRepository extends JpaRepository<ConfigurationItem, Long> {
    List<ConfigurationItem> findByCiType(String ciType);
    List<ConfigurationItem> findByCiNameContaining(String ciName);
}
