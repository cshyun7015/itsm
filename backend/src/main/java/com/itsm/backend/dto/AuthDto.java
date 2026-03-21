package com.itsm.backend.dto;

import lombok.AllArgsConstructor;
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
    public static class JwtResponse {
        private String token;
        private String username;
        private String role;
        private String name;
    }
}