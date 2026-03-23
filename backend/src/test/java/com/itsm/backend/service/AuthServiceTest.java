package com.itsm.backend.service;

import com.itsm.backend.domain.*;
import com.itsm.backend.dto.AuthDto;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtTokenProvider tokenProvider;
    @Mock private UserRepository userRepository;
    @InjectMocks private AuthService authService;

    @Test
    @DisplayName("로그인 성공 시 고객사 정보가 포함된 응답을 반환해야 함")
    void loginSuccessTest() {
        // Given
        Company company = Company.builder().name("테스트고객사").code("TEST-CO").build();
        User user = new User();
        user.setUsername("admin");
        user.setName("관리자");
        user.setRole(Role.ROLE_ADMIN);
        user.setCompany(company);

        AuthDto.LoginRequest request = new AuthDto.LoginRequest();
        request.setUsername("admin");
        request.setPassword("1234");

        when(authenticationManager.authenticate(any())).thenReturn(mock(Authentication.class));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken(any())).thenReturn("valid_jwt_token");

        // When
        AuthDto.JwtResponse response = authService.login(request);

        // Then
        assertNotNull(response.getToken());
        assertEquals("TEST-CO", response.getCompanyCode());
        assertEquals("테스트고객사", response.getCompanyName());
        verify(userRepository, times(1)).findByUsername("admin");
    }
}