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
    private final CommonCodeRepository commonCodeRepository; // 🌟 추가
    private final UserRepository userRepository;
    private final SlaPolicyRepository slaPolicyRepository;

    @Transactional
    public void generateDummyData() {
        Random random = new Random();

        // 🌟 Enum 값을 읽어 공통 코드(CommonCode) 테이블에 초기 데이터 적재
        if (commonCodeRepository.count() == 0) {
            // 1. Priority Enum 처리
            for (Priority p : Priority.values()) {
                CommonCode code = new CommonCode();
                code.setGroupCode("PRIORITY");
                code.setCodeValue(p.name());
                // Enum 값에 따라 한글 이름 매핑
                code.setCodeName(p == Priority.CRITICAL ? "긴급" : p == Priority.HIGH ? "높음" : p == Priority.MEDIUM ? "보통" : "낮음");
                code.setDescription("시스템 우선순위 코드");
                commonCodeRepository.save(code);
            }

            // 2. TicketStatus Enum 처리
            for (TicketStatus ts : TicketStatus.values()) {
                CommonCode code = new CommonCode();
                code.setGroupCode("TICKET_STATUS");
                code.setCodeValue(ts.name());
                code.setCodeName(ts == TicketStatus.OPEN ? "접수/대기" : ts == TicketStatus.IN_PROGRESS ? "처리 중" : "완료");
                code.setDescription("인시던트 진행 상태 코드");
                commonCodeRepository.save(code);
            }

            // 3. 자산 분류(CI_TYPE) 수동 추가
            String[] ciTypes = {"SERVER", "DATABASE", "NETWORK", "SOFTWARE"};
            String[] ciNames = {"서버", "데이터베이스", "네트워크 장비", "소프트웨어"};
            for (int i = 0; i < ciTypes.length; i++) {
                CommonCode code = new CommonCode();
                code.setGroupCode("CI_TYPE");
                code.setCodeValue(ciTypes[i]);
                code.setCodeName(ciNames[i]);
                code.setDescription("IT 자산 분류 코드");
                commonCodeRepository.save(code);
            }
        }

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

        // 🌟 SLA 정책 목록을 미리 불러옵니다.
        List<SlaPolicy> slaPolicies = slaPolicyRepository.findAll();

        // 4. Incident (장애) 100개 생성
        TicketStatus[] incStatuses = {TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED};

        // 🌟 변수명 충돌을 피하기 위해 이름을 'priorityValues'로 변경!
        Priority[] priorityValues = Priority.values();

        for (int i = 1; i <= 100; i++) {
            Incident inc = new Incident();
            inc.setTitle("장애 발생 리포트 - " + i + "번 건");
            inc.setDescription("시스템 오류 및 응답 지연이 발생했습니다.");
            inc.setRequesterName("사용자" + (i % 20 + 1));
            inc.setRequesterId(String.valueOf(1000 + (i % 20 + 1)));

            TicketStatus randomStatus = incStatuses[random.nextInt(incStatuses.length)];

            // 🌟 에러의 원인 해결! (개별 인시던트의 우선순위를 'randomPriority'라는 이름으로 선언)
            Priority randomPriority = priorityValues[random.nextInt(priorityValues.length)];

            inc.setStatus(randomStatus);
            inc.setPriority(randomPriority);
            inc.setCompany(defaultCompany);

            // SLA 목표 시간 및 위반(Breach) 계산 로직 (1~5일 전 과거로 세팅)
            LocalDateTime randomPastDate = LocalDateTime.now()
                    .minusDays(random.nextInt(5))
                    .minusHours(random.nextInt(24));
            inc.setCreatedAt(randomPastDate);

            // 해당 우선순위에 맞는 SLA 정책 찾기
            SlaPolicy matchingPolicy = slaPolicies.stream()
                    .filter(p -> "INCIDENT".equals(p.getTargetType()) && p.getPriority().equals(randomPriority.name()))
                    .findFirst()
                    .orElse(null);

            if (matchingPolicy != null) {
                // 목표 해결 일시 = 생성일시 + SLA 정책의 목표 시간
                LocalDateTime targetTime = randomPastDate.plusHours(matchingPolicy.getTargetResolutionHours());
                inc.setTargetResolutionTime(targetTime);

                // 현재 시간이 목표 시간을 지났다면 SLA 위반! (조건식의 결과 boolean을 바로 대입)
                inc.setSlaBreached(randomStatus != TicketStatus.RESOLVED && LocalDateTime.now().isAfter(targetTime));
            }

            // 자산 연결
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

        // 🌟 사용자(User) 100명 생성
        if (userRepository.count() == 0) {
            String[] depts = {"IT기획팀", "인프라운영팀", "보안팀", "영업1팀", "경영지원팀"};
            String[] roles = {"ADMIN", "ENGINEER", "USER"};
            for (int i = 1; i <= 100; i++) {
                User u = new User();
                u.setLoginId("user_" + String.format("%03d", i));
                u.setName("사용자" + i);
                u.setDepartment(depts[random.nextInt(depts.length)]);
                u.setRole(roles[random.nextInt(roles.length)]);
                u.setStatus(random.nextDouble() > 0.9 ? "INACTIVE" : "ACTIVE"); // 10%는 정지 계정
                userRepository.save(u);
            }
        }

        // 🌟 고객사(Company) 추가 생성 (기존 기본 고객사 1개 외에 페이징 테스트를 위해 50개 추가)
        if (companyRepository.count() <= 1) {
            String[] locations = {"서울시 강남구", "경기도 판교", "부산시 해운대구", "대전시 유성구"};
            for (int i = 1; i <= 50; i++) {
                Company c = new Company();
                c.setName("파트너스 " + i + "호");
                c.setAddress(locations[random.nextInt(locations.length)] + " " + i + "번길");
                // 엔티티에 manager나 contact 필드가 있다면 세팅해주시고, 없다면 제외하세요.
                companyRepository.save(c);
            }
        }

        // 🌟 SLA 기본 정책 4가지 자동 생성
        if (slaPolicyRepository.count() == 0) {
            // 이미 선언된 Priority Enum을 순회하며 정책을 만듭니다.
            // 1. 인시던트 정책 생성 (방금 만든 추출 메서드 활용!)
            for (Priority p : Priority.values()) {
                slaPolicyRepository.save(createIncidentPolicy(p));
            }

            // 2. 서비스 요청(SR) 기본 정책 추가
            // 서비스 요청(SR)에 대한 기본 정책도 1개 추가
            SlaPolicy srPolicy = new SlaPolicy();
            srPolicy.setPolicyName("일반 서비스 요청 처리");
            srPolicy.setTargetType("SERVICE_REQUEST");
            srPolicy.setPriority("MEDIUM");
            srPolicy.setTargetResolutionHours(48);
            srPolicy.setDescription("일반적인 서비스 요청은 48시간(2일) 이내에 처리되어야 합니다.");
            slaPolicyRepository.save(srPolicy);
        }
    }

    // 🌟 밖으로 빼낸(Extracted) 전용 메서드
    private SlaPolicy createIncidentPolicy(Priority p) {
        SlaPolicy policy = new SlaPolicy();
        policy.setPolicyName("장애 해결 보장 - " + p.name());
        policy.setTargetType("INCIDENT");
        policy.setPriority(p.name());

        int targetHour = switch (p) {
            case CRITICAL -> 2;
            case HIGH -> 4;
            case MEDIUM -> 24;
            case LOW -> 72;
        };

        policy.setTargetResolutionHours(targetHour);
        policy.setDescription(p.name() + " 등급 장애는 " + targetHour + "시간 이내에 해결해야 합니다.");

        return policy; // 완성된 policy 객체 반환!
    }
}