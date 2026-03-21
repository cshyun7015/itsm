package com.itsm.backend.service;

import com.itsm.backend.domain.*;
import com.itsm.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class SampleDataService {

    private final CIRepository ciRepository;
    private final IncidentRepository incidentRepository;
    private final ServiceRequestRepository requestRepository;
    private final ChangeRequestRepository changeRepository;
    private final CompanyRepository companyRepository;
    private final ServiceCatalogRepository serviceCatalogRepository;

    @Transactional
    public void generateDummyData() {
        Random random = new Random();

        // 1. 기본 고객사(Company) 생성 또는 조회
        Company defaultCompany = companyRepository.findById(1L)
                .orElseGet(() -> {
                    Company c = new Company();
                    c.setName("기본 고객사 (Sample Corp)");
                    return companyRepository.save(c);
                });

        // 🌟 2. Catalog -> ServiceCatalog 로 변경
        List<ServiceCatalog> catalogList = serviceCatalogRepository.findAll();
        if (catalogList.isEmpty()) {
            String[] names = {"노트북 대여", "VPN 권한 신청", "소프트웨어 설치", "메일 계정 생성", "서버 리소스 증설"};
            String[] categories = {"HW", "ACCESS", "SW", "ACCOUNT", "INFRA"};
            for (int i = 0; i < names.length; i++) {
                ServiceCatalog cat = new ServiceCatalog();
                cat.setName(names[i]);
                cat.setCategory(categories[i]);
                cat.setDescription(names[i] + " 서비스입니다.");
                cat.setEstimatedDays(i + 1);
                catalogList.add(serviceCatalogRepository.save(cat));
            }
        }

        // 3. CMDB (자산) 100개 생성
        String[] ciTypes = {"SERVER", "DATABASE", "NETWORK", "SOFTWARE"};
        String[] envs = {"PROD", "STAGE", "DEV"};
        List<ConfigurationItem> ciList = new ArrayList<>();

        for (int i = 1; i <= 100; i++) {
            ConfigurationItem ci = new ConfigurationItem();
            String type = ciTypes[random.nextInt(ciTypes.length)];
            ci.setCiName("Asset-" + type + "-" + String.format("%03d", i));
            ci.setCiType(type);
            ci.setIpAddress("192.168." + random.nextInt(255) + "." + random.nextInt(255));
            ci.setEnvironment(envs[random.nextInt(envs.length)]);
            ci.setOwnerName("담당자" + (i % 10 + 1));
            ci.setStatus(random.nextDouble() > 0.85 ? "IN_MAINTENANCE" : "ACTIVE");
            ci.setDescription("자동 생성된 자산 데이터 " + i);
            ciList.add(ciRepository.save(ci));
        }

        // 4. Incident (장애) 100개 생성
        TicketStatus[] incStatuses = {TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED};
        Priority[] priorities = Priority.values();

        for (int i = 1; i <= 100; i++) {
            Incident inc = new Incident();
            inc.setTitle("장애 발생 리포트 - " + i + "번 건");
            inc.setDescription("시스템 오류 및 응답 지연이 발생했습니다.");
            inc.setRequesterName("사용자" + (i % 20 + 1));
            inc.setRequesterId(String.valueOf(1000 + (i % 20 + 1)));
            inc.setStatus(incStatuses[random.nextInt(incStatuses.length)]);
            inc.setPriority(priorities[random.nextInt(priorities.length)]);
            inc.setCompany(defaultCompany);

            ConfigurationItem randomCi = ciList.get(random.nextInt(ciList.size()));
            inc.setCiId(randomCi.getId());
            inc.setCiName(randomCi.getCiName());

            incidentRepository.save(inc);
        }

        // 5. Service Request (서비스 요청) 100개 생성
        String[] srStatuses = {"PENDING", "APPROVED", "REJECTED"};
        for (int i = 1; i <= 100; i++) {
            ServiceRequest sr = new ServiceRequest();
            sr.setTitle("신규 서비스 및 권한 신청 - " + i);
            sr.setDescription("자동 생성된 서비스 요청 데이터입니다.");
            sr.setRequesterName("요청자" + (i % 15 + 1));

            // 🌟 추가된 부분: 고객사와 요청자 ID 세팅
            sr.setCompany(defaultCompany);
            sr.setRequesterId(String.valueOf(1000 + (i % 15 + 1)));

            sr.setApprovalStatus(srStatuses[random.nextInt(srStatuses.length)]);
            sr.setTargetDeliveryDate(LocalDate.now().plusDays(random.nextInt(14)));

            // 🌟 에러 해결의 핵심: 필수 필드인 Catalog 설정
            sr.setCatalog(catalogList.get(random.nextInt(catalogList.size())));

            requestRepository.save(sr);
        }

        // 6. Change Request (변경 관리) 100개 생성
        String[] crStatuses = {"CAB_APPROVAL", "SCHEDULED", "COMPLETED", "REJECTED"};
        String[] riskLevels = {"LOW", "MEDIUM", "HIGH"};
        for (int i = 1; i <= 100; i++) {
            ChangeRequest cr = new ChangeRequest();
            cr.setTitle("시스템 정기/수시 변경 작업 - " + i);
            cr.setReason("보안 패치 및 성능 개선");
            cr.setRiskLevel(riskLevels[random.nextInt(riskLevels.length)]);
            cr.setPlan("1. 사전 백업 2. 패치 3. 검증");
            cr.setBackoutPlan("LVM 스냅샷 롤백");
            cr.setRequesterName("엔지니어" + (i % 5 + 1));

            // 🌟 추가된 부분: 혹시 몰라서 ChangeRequest에도 미리 넣어둡니다! (에러 사전 방지)
            //cr.setCompany(defaultCompany);
            //cr.setRequesterId(String.valueOf(1000 + (i % 5 + 1)));

            cr.setStatus(crStatuses[random.nextInt(crStatuses.length)]);
            cr.setScheduledAt(LocalDateTime.now().plusDays(random.nextInt(30)));
            changeRepository.save(cr);
        }
    }
}