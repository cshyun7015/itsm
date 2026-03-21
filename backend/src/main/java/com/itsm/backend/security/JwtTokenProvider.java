package com.itsm.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
//import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    // 🌟 실무에서는 application.yml에 암호화된 키를 넣지만, 테스트를 위해 고정 키를 사용합니다.
    private final String jwtSecret = "ItsmSuperSecretKeyForJwtTokenGeneration2026!@#";

    // 키를 해시 알고리즘(HS256)으로 변환
    private final Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

    // 토큰 만료 시간 (예: 24시간 = 86400000 밀리초)
    private final int jwtExpirationMs = 86400000;

    // 1. 토큰 생성 메서드
    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(username)
                .claim("role", role) // 토큰 안에 권한 정보도 슬쩍 넣어줍니다.
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // 2. 토큰에서 유저 아이디(username) 추출
    public String getUsernameFromToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    // 3. 토큰의 유효성 검증
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (SecurityException | MalformedJwtException e) {
            log.error("잘못된 JWT 서명입니다.");
        } catch (ExpiredJwtException e) {
            log.error("만료된 JWT 토큰입니다.");
        } catch (UnsupportedJwtException e) {
            log.error("지원되지 않는 JWT 토큰입니다.");
        } catch (IllegalArgumentException e) {
            log.error("JWT 토큰이 잘못되었습니다.");
        }
        return false;
    }
}