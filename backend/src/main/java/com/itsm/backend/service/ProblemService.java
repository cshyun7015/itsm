package com.itsm.backend.service;

import com.itsm.backend.domain.Company;
import com.itsm.backend.domain.Problem;
import com.itsm.backend.dto.ProblemDto;
import com.itsm.backend.repository.CompanyRepository;
import com.itsm.backend.repository.ProblemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final CompanyRepository companyRepository;

    @Transactional(readOnly = true)
    public Page<Problem> getProblems(int page, int size, String sort, String direction, String status, String title) {
        Sort.Direction dir = Sort.Direction.fromString(direction);
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));

        return problemRepository.searchProblems(status, title, pageable);
    }

    @Transactional
    public Problem createProblem(ProblemDto dto) {
        Problem problem = new Problem();
        problem.setTitle(dto.getTitle());
        problem.setDescription(dto.getDescription());
        problem.setStatus(dto.getStatus() != null ? dto.getStatus() : "OPEN");
        problem.setPriority(dto.getPriority());
        problem.setRootCause(dto.getRootCause());
        problem.setWorkaround(dto.getWorkaround());
        problem.setManagerName(dto.getManagerName());
        problem.setCreatedAt(LocalDateTime.now());

        // 🌟 String 날짜를 파싱하여 자정(00:00:00) 시간으로 변환 후 저장
        if (dto.getTargetResolutionDate() != null && !dto.getTargetResolutionDate().isEmpty()) {
            problem.setTargetResolutionDate(LocalDate.parse(dto.getTargetResolutionDate()).atStartOfDay());
        }

        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고객사입니다."));
            problem.setCompany(company);
        }

        return problemRepository.save(problem);
    }

    @Transactional
    public Problem updateProblem(Long id, ProblemDto dto) {
        Problem problem = problemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 문제(Problem)입니다."));

        problem.setTitle(dto.getTitle());
        problem.setDescription(dto.getDescription());
        problem.setStatus(dto.getStatus());
        problem.setPriority(dto.getPriority());
        problem.setRootCause(dto.getRootCause());
        problem.setWorkaround(dto.getWorkaround());
        problem.setManagerName(dto.getManagerName());

        // 🌟 수정 시에도 동일하게 날짜 문자열을 변환
        if (dto.getTargetResolutionDate() != null && !dto.getTargetResolutionDate().isEmpty()) {
            problem.setTargetResolutionDate(LocalDate.parse(dto.getTargetResolutionDate()).atStartOfDay());
        } else {
            problem.setTargetResolutionDate(null); // 날짜를 지웠을 경우 처리
        }

        if (dto.getCompanyId() != null) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 고객사입니다."));
            problem.setCompany(company);
        }

        return problemRepository.save(problem);
    }

    @Transactional
    public void deleteProblem(Long id) {
        if (!problemRepository.existsById(id)) {
            throw new IllegalArgumentException("존재하지 않는 문제(Problem)입니다.");
        }
        problemRepository.deleteById(id);
    }
}