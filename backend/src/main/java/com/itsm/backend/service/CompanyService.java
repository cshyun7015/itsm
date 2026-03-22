package com.itsm.backend.service;

import com.itsm.backend.domain.Company;
import com.itsm.backend.dto.CompanyDto;
import com.itsm.backend.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyService {
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public Page<Company> getCompanies(int page, int size, String sort, String dir, String name, String code) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(dir), sort));
        return companyRepository.searchCompanies(name, code, pageable);
    }

    @Transactional
    public Company createCompany(CompanyDto dto) {
        Company c = new Company();
        updateEntity(c, dto);
        return companyRepository.save(c);
    }

    @Transactional
    public Company updateCompany(Long id, CompanyDto dto) {
        Company c = companyRepository.findById(id).orElseThrow();
        updateEntity(c, dto);
        return companyRepository.save(c);
    }

    @Transactional
    public void deleteCompany(Long id) { companyRepository.deleteById(id); }

    private void updateEntity(Company c, CompanyDto d) {
        c.setName(d.getName()); c.setAddress(d.getAddress());
        c.setCode(d.getCode()); c.setDomain(d.getDomain()); c.setManagerName(d.getManagerName());
    }
}