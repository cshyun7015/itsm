package com.itsm.backend.service;

import com.itsm.backend.domain.User;
import com.itsm.backend.dto.AuthDto;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.security.JwtTokenProvider;
import com.itsm.backend.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    public AuthDto.JwtResponse login(AuthDto.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        UserPrincipal userPrincipal = new UserPrincipal(user);
        String jwt = tokenProvider.generateToken(userPrincipal);

        return AuthDto.JwtResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .name(user.getName())
                .role(user.getRole().name())
                .companyCode(userPrincipal.getCompanyCode())
                .companyName(user.getCompany() != null ? user.getCompany().getName() : "NEXUS SYSTEM")
                .build();
    }
}