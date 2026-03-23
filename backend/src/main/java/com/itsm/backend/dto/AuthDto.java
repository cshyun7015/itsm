package com.itsm.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

public class AuthDto {

    @Getter @Setter
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Getter @Setter
    @AllArgsConstructor
    @Builder
    public static class JwtResponse {
        private String token;
        private String username;
        private String role;
        private String name;
        // 🌟 멀티테넌시 정보 추가
        private String companyCode;
        private String companyName;
    }
}