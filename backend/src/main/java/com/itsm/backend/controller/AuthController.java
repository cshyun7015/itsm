package com.itsm.backend.controller;

import com.itsm.backend.dto.AuthDto;
import com.itsm.backend.domain.User;
import com.itsm.backend.repository.UserRepository;
import com.itsm.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthDto.LoginRequest loginRequest) {
        // 1. 아이디와 비밀번호가 맞는지 검증합니다. (틀리면 여기서 에러가 발생합니다)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // 2. 검증이 완료되면 SecurityContext에 저장합니다.
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // 3. DB에서 유저 정보를 다시 가져와서 토큰에 넣을 준비를 합니다.
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🌟 범인 색출을 위한 함정 코드 추가!!
        System.out.println("1. 프론트가 보낸 ID: " + loginRequest.getUsername());
        System.out.println("2. DB 유저의 ID(username): " + user.getUsername());
        System.out.println("3. DB 유저의 이름(name): " + user.getName());

        // 4. JWT 토큰을 발급합니다.
        String jwt = tokenProvider.generateToken(user.getUsername(), user.getRole().name());

        // 5. 발급된 토큰과 유저 정보를 프론트엔드로 돌려줍니다.
        return ResponseEntity.ok(new AuthDto.JwtResponse(
                jwt,
                user.getUsername(),
                user.getRole().name(),
                user.getName()
        ));
    }
}