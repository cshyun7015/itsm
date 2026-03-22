# 1. Build Stage
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app

# 빌드 파일 복사
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle ./
COPY src src

# Mac/Windows 환경 차이로 인한 gradlew 실행 권한 오류 방지
RUN chmod +x ./gradlew

# Spring Boot 실행 가능한 jar 파일 빌드 (-x test로 테스트는 생략하여 속도 향상)
#RUN ./gradlew bootJar -x test
RUN ./gradlew bootJar

# 2. Execution Stage (ARM64 최적화 JRE)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# 빌드된 jar 파일 복사 (Spring Boot 3.x/2.x 기본 네이밍 룰 적용)
COPY --from=builder /app/build/libs/*-SNAPSHOT.jar app.jar

EXPOSE 8080

# tail 커맨드를 제거하고 실제 Java 애플리케이션 실행
ENTRYPOINT ["java", "-jar", "app.jar"]
