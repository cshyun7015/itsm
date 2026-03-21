package com.itsm.backend.service;

import com.itsm.backend.domain.ServiceCatalog;
import com.itsm.backend.repository.ServiceCatalogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceCatalogService {
    private final ServiceCatalogRepository catalogRepository;

    public List<ServiceCatalog> getActiveCatalogs() {
        return catalogRepository.findByIsActiveTrue();
    }
}
