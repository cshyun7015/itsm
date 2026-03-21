package com.itsm.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing // 이 부분을 꼭 추가해주세요!
@SpringBootApplication
public class ItsmBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ItsmBackendApplication.class, args);
	}

}
