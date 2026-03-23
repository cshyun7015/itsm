package com.itsm.backend.service;

import com.itsm.backend.domain.*;
import com.itsm.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class SampleDataService {

    private final CIRepository ciRepository;
    private final IncidentRepository incidentRepository;
    private final ServiceRequestRepository requestRepository;
    private final ChangeRequestRepository changeRepository;
    private final CompanyRepository companyRepository;
    private final ServiceCatalogRepository serviceCatalogRepository;
    private final CommonCodeRepository commonCodeRepository;
    private final UserRepository userRepository;
    private final SlaPolicyRepository slaPolicyRepository;
    private final EventRepository eventRepository;
    private final ProblemRepository problemRepository;

    // 🌟 변경점: ReleaseRequestRepository -> ReleaseRecordRepository 로 수정
    private final ReleaseRequestRepository releaseRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void generateDummyData() {
        Random random = new Random();

        // 🌟 1. 기본 고객사(Company)를 가장 먼저 생성 또는 조회합니다!
        Company defaultCompany = companyRepository.findById(1L)
                .orElseGet(() -> {
                    Company c = new Company();
                    c.setName("기본 고객사 (Sample Corp)");
                    c.setCode("SAMPLE-CORP"); // 식별 코드 추가
                    return companyRepository.save(c);
                });

        // 🌟 2. 테스트용 기본 계정에 방금 만든 고객사를 매핑합니다!
        if (userRepository.findByUsername("admin").isEmpty()) {
            String encodedPassword = passwordEncoder.encode("1234");

            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(encodedPassword);
            admin.setName("시스템 관리자");
            admin.setDepartment("IT 인프라팀");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setCompany(defaultCompany); // 🌟 고객사 할당
            userRepository.save(admin);

            User agent = new User();
            agent.setUsername("agent");
            agent.setPassword(encodedPassword);
            agent.setName("서비스 데스크");
            agent.setDepartment("IT 지원팀");
            agent.setRole(Role.ROLE_AGENT);
            agent.setCompany(defaultCompany); // 🌟 고객사 할당
            userRepository.save(agent);

            User user = new User();
            user.setUsername("user");
            user.setPassword(encodedPassword);
            user.setName("일반 임직원");
            user.setDepartment("영업팀");
            user.setRole(Role.ROLE_USER);
            user.setCompany(defaultCompany); // 🌟 고객사 할당
            userRepository.save(user);
        }

        // 2. 공통 코드(CommonCode) 초기 데이터 적재
        if (commonCodeRepository.count() == 0) {
            for (Priority p : Priority.values()) {
                CommonCode code = new CommonCode();
                code.setGroupCode("PRIORITY");
                code.setCodeValue(p.name());
                code.setCodeName(p == Priority.CRITICAL ? "긴급" : p == Priority.HIGH ? "높음" : p == Priority.MEDIUM ? "보통" : "낮음");
                code.setDescription("시스템 우선순위 코드");
                commonCodeRepository.save(code);
            }

            for (TicketStatus ts : TicketStatus.values()) {
                CommonCode code = new CommonCode();
                code.setGroupCode("TICKET_STATUS");
                code.setCodeValue(ts.name());
                code.setCodeName(ts == TicketStatus.OPEN ? "접수/대기" : ts == TicketStatus.IN_PROGRESS ? "처리 중" : "완료");
                code.setDescription("인시던트 진행 상태 코드");
                commonCodeRepository.save(code);
            }

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

        // 4. 서비스 카탈로그(ServiceCatalog) 생성
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

        // 5. CMDB (자산) 100개 생성
        String[] ciTypes = {"SERVER", "DATABASE", "NETWORK", "SOFTWARE"};
        String[] envs = {"PROD", "STAGE", "DEV"};
        List<ConfigurationItem> ciList = new ArrayList<>();

        if (ciRepository.count() == 0) {
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
        }

        // 6. SLA 기본 정책 자동 생성
        if (slaPolicyRepository.count() == 0) {
            for (Priority p : Priority.values()) {
                slaPolicyRepository.save(createIncidentPolicy(p));
            }
            SlaPolicy srPolicy = new SlaPolicy();
            srPolicy.setPolicyName("일반 서비스 요청 처리");
            srPolicy.setTargetType("SERVICE_REQUEST");

            // 🌟 변경점: priority -> targetPriority, targetResolutionHours -> targetTime
            srPolicy.setTargetPriority("MEDIUM");
            srPolicy.setTargetTime(48);

            srPolicy.setDescription("일반적인 서비스 요청은 48시간(2일) 이내에 처리되어야 합니다.");
            slaPolicyRepository.save(srPolicy);
        }

        // 7. Incident (장애) 100개 생성
        List<SlaPolicy> slaPolicies = slaPolicyRepository.findAll();
        TicketStatus[] incStatuses = {TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED};
        Priority[] priorityValues = Priority.values();

        if (incidentRepository.count() == 0) {
            for (int i = 1; i <= 100; i++) {
                Incident inc = new Incident();
                inc.setTitle("장애 발생 리포트 - " + i + "번 건");
                inc.setDescription("시스템 오류 및 응답 지연이 발생했습니다.");
                inc.setRequesterName("사용자" + (i % 20 + 1));
                inc.setRequesterId(String.valueOf(1000 + (i % 20 + 1)));

                TicketStatus randomStatus = incStatuses[random.nextInt(incStatuses.length)];
                Priority randomPriority = priorityValues[random.nextInt(priorityValues.length)];

                inc.setStatus(randomStatus);
                inc.setPriority(randomPriority);
                inc.setCompany(defaultCompany);

                LocalDateTime randomPastDate = LocalDateTime.now().minusDays(random.nextInt(5)).minusHours(random.nextInt(24));
                inc.setCreatedAt(randomPastDate);

                // 🌟 변경점: getPriority() -> getTargetPriority() 로 수정
                SlaPolicy matchingPolicy = slaPolicies.stream()
                        .filter(p -> "INCIDENT".equals(p.getTargetType()) && p.getTargetPriority().equals(randomPriority.name()))
                        .findFirst()
                        .orElse(null);

                if (matchingPolicy != null) {
                    // 🌟 변경점: getTargetResolutionHours() -> getTargetTime() 로 수정
                    LocalDateTime targetTime = randomPastDate.plusHours(matchingPolicy.getTargetTime());
                    inc.setTargetResolutionTime(targetTime);
                    inc.setSlaBreached(randomStatus != TicketStatus.RESOLVED && LocalDateTime.now().isAfter(targetTime));
                }

                ConfigurationItem randomCi = ciList.get(random.nextInt(ciList.size()));
                inc.setCiId(randomCi.getId());
                inc.setCiName(randomCi.getCiName());

                incidentRepository.save(inc);
            }
        }

        // 8. Service Request (서비스 요청) 100개 생성
        String[] srStatuses = {"PENDING", "APPROVED", "REJECTED"};
        if (requestRepository.count() == 0) {
            for (int i = 1; i <= 100; i++) {
                ServiceRequest sr = new ServiceRequest();
                sr.setTitle("신규 서비스 및 권한 신청 - " + i);
                sr.setDescription("자동 생성된 서비스 요청 데이터입니다.");
                sr.setRequesterName("요청자" + (i % 15 + 1));
                sr.setCompany(defaultCompany);
                sr.setRequesterId(String.valueOf(1000 + (i % 15 + 1)));
                sr.setApprovalStatus(srStatuses[random.nextInt(srStatuses.length)]);
                sr.setTargetDeliveryDate(LocalDate.now().plusDays(random.nextInt(14)));
                sr.setCatalog(catalogList.get(random.nextInt(catalogList.size())));
                requestRepository.save(sr);
            }
        }

        // 9. Change Request (변경 관리) 100개 생성
        String[] crStatuses = {"CAB_APPROVAL", "SCHEDULED", "COMPLETED", "REJECTED"};
        String[] riskLevels = {"LOW", "MEDIUM", "HIGH"};
        if (changeRepository.count() == 0) {
            for (int i = 1; i <= 100; i++) {
                ChangeRequest cr = new ChangeRequest();
                cr.setTitle("시스템 정기/수시 변경 작업 - " + i);
                cr.setReason("보안 패치 및 성능 개선");
                cr.setRiskLevel(riskLevels[random.nextInt(riskLevels.length)]);
                cr.setPlan("1. 사전 백업 2. 패치 3. 검증");
                cr.setBackoutPlan("LVM 스냅샷 롤백");
                cr.setRequesterName("엔지니어" + (i % 5 + 1));
                cr.setStatus(crStatuses[random.nextInt(crStatuses.length)]);
                cr.setScheduledAt(LocalDateTime.now().plusDays(random.nextInt(30)));
                changeRepository.save(cr);
            }
        }

        // 🌟 3. 100명의 더미 사용자를 만들 때도 고객사를 매핑해줍니다!
        if (userRepository.count() <= 3) { // 3명(admin, agent, user)만 있을 때 실행
            String[] departments = {"IT기획팀", "인프라운영팀", "보안팀", "영업1팀", "경영지원팀"};
            Role[] roles = {Role.ROLE_ADMIN, Role.ROLE_AGENT, Role.ROLE_USER};
            String encodedPassword = passwordEncoder.encode("1234");

            for (int i = 1; i <= 100; i++) {
                User u = new User();
                u.setUsername("user_" + String.format("%03d", i));
                u.setPassword(encodedPassword);
                u.setName("사용자" + i);
                u.setDepartment(departments[random.nextInt(departments.length)]);
                u.setRole(roles[random.nextInt(roles.length)]);
                u.setStatus("ACTIVE");
                u.setCompany(defaultCompany); // 🌟 고객사 할당
                userRepository.save(u);
            }
        }

        // 11. Event (이벤트 로그) 50개 생성
        if (eventRepository.count() == 0) {
            String[] sources = {"Zabbix", "AWS CloudWatch", "Datadog", "Prometheus"};
            String[] severities = {"INFO", "WARNING", "CRITICAL"};
            String[] messages = {
                    "CPU 사용률 80% 도달", "디스크 여유 공간 10% 미만", "DB Connection Timeout",
                    "백업 작업 정상 완료", "네트워크 트래픽 스파이크 감지"
            };

            for (int i = 1; i <= 50; i++) {
                Event ev = new Event();
                ev.setSource(sources[random.nextInt(sources.length)]);
                ev.setSeverity(severities[random.nextInt(severities.length)]);
                ev.setMessage(messages[random.nextInt(messages.length)]);
                ev.setNode("192.168.1." + (random.nextInt(254) + 1));

                if ("CRITICAL".equals(ev.getSeverity())) {
                    ev.setStatus("PROCESSED");
                    ev.setRelatedIncidentId((long) (random.nextInt(100) + 1));
                } else {
                    ev.setStatus("NEW");
                }
                eventRepository.save(ev);
            }
        }

        // 12. Problem (문제 관리) 30개 생성
        if (problemRepository.count() == 0) {
            String[] probStatuses = {"OPEN", "INVESTIGATING", "KNOWN_ERROR", "RESOLVED"};
            String[] titles = {
                    "결제 시스템 간헐적 타임아웃 현상",
                    "특정 시간대 DB CPU 100% 스파이크 현상",
                    "웹 서버 메모리 누수(Memory Leak) 의심",
                    "사내망 VPN 연결 불안정 현상"
            };

            for (int i = 1; i <= 30; i++) {
                Problem prob = new Problem();
                prob.setTitle(titles[random.nextInt(titles.length)] + " - #" + i);
                prob.setDescription("해당 현상이 여러 차례의 장애(Incident)로 접수되어 근본 원인 분석을 시작합니다.");
                prob.setStatus(probStatuses[random.nextInt(probStatuses.length)]);
                prob.setPriority(Priority.values()[random.nextInt(Priority.values().length)].name());
                prob.setManagerName("문제관리자" + (i % 5 + 1));
                prob.setCompany(defaultCompany);

                if ("KNOWN_ERROR".equals(prob.getStatus()) || "RESOLVED".equals(prob.getStatus())) {
                    prob.setRootCause("특정 쿼리의 인덱스 누락으로 인한 Full Table Scan이 원인으로 파악됨.");
                    prob.setWorkaround("서비스 데스크 담당자는 장애 발생 시 DB 세션을 강제 킬(Kill) 처리 후 재시작 바랍니다.");
                }

                prob.setCreatedAt(LocalDateTime.now().minusDays(random.nextInt(30)));
                prob.setTargetResolutionDate(LocalDateTime.now().plusDays(random.nextInt(60)));
                problemRepository.save(prob);
            }
        }

        // 13. Release (배포 관리) 20개 생성
        if (releaseRepository.count() == 0) {
            String[] relStatuses = {"PLANNING", "BUILDING", "TESTING", "DEPLOYING", "COMPLETED", "FAILED"};
            String[] relTypes = {"MAJOR", "MINOR", "EMERGENCY"};
            String[] titles = {
                    "정기 통합 시스템 업데이트",
                    "결제 모듈 보안 패치",
                    "신규 대시보드 UI 배포",
                    "DB 성능 개선 인덱스 추가 반영"
            };

            for (int i = 1; i <= 20; i++) {
                ReleaseRequest rel = new ReleaseRequest();
                rel.setVersion("v" + (random.nextInt(3) + 1) + "." + random.nextInt(10) + "." + i);
                rel.setTitle(titles[random.nextInt(titles.length)] + " (" + rel.getVersion() + ")");
                rel.setDescription("승인된 변경(Change) 건들을 묶어서 상용 환경에 배포합니다.");

                rel.setStatus(relStatuses[random.nextInt(relStatuses.length)]);
                rel.setReleaseType(relTypes[random.nextInt(relTypes.length)]);
                rel.setManagerName("배포관리자" + (i % 3 + 1));
                rel.setCompany(defaultCompany);

                LocalDateTime target = LocalDateTime.now().plusDays(random.nextInt(30) - 15);
                rel.setTargetDate(target);

                if ("COMPLETED".equals(rel.getStatus()) || "FAILED".equals(rel.getStatus())) {
                    rel.setActualDate(target.plusHours(random.nextInt(5) + 1));
                }

                releaseRepository.save(rel);
            }
        }
    }

    // 🌟 밖으로 빼낸 전용 메서드 수정 (SLA 필드명 매칭)
    private SlaPolicy createIncidentPolicy(Priority p) {
        SlaPolicy policy = new SlaPolicy();
        policy.setPolicyName("장애 해결 보장 - " + p.name());
        policy.setTargetType("INCIDENT");

        // 🌟 변경점: priority -> targetPriority
        policy.setTargetPriority(p.name());

        int targetHour = switch (p) {
            case CRITICAL -> 2;
            case HIGH -> 4;
            case MEDIUM -> 24;
            case LOW -> 72;
        };

        // 🌟 변경점: targetResolutionHours -> targetTime
        policy.setTargetTime(targetHour);
        policy.setDescription(p.name() + " 등급 장애는 " + targetHour + "시간 이내에 해결해야 합니다.");

        return policy;
    }
}