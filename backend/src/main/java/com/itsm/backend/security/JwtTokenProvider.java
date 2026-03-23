package com.itsm.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtTokenProvider {

    // 🌟 보안을 위해 실제 환경에서는 환경 변수나 application.yml에서 관리하는 것이 좋습니다.
    private final String jwtSecret = "ItsmSuperSecretKeyForJwtTokenGeneration2026!@#";
    private final Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());

    // 토큰 만료 시간: 24시간 (86,400,000ms)
    private final int jwtExpirationMs = 86400000;

    /**
     * 1. JWT 토큰 생성 (멀티테넌시 지원)
     * @param userPrincipal 인증된 사용자 상세 정보
     * @return 생성된 JWT 문자열
     */
    public String generateToken(UserPrincipal userPrincipal) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .claim("role", userPrincipal.getAuthorities().iterator().next().getAuthority())
                // 🌟 핵심: 토큰에 고객사 코드를 추가하여 매 요청마다 DB 조회를 하지 않게 함
                .claim("companyCode", userPrincipal.getCompanyCode())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 2. 토큰에서 사용자 아이디(username) 추출
     */
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    /**
     * 3. 토큰에서 고객사 코드(companyCode) 추출
     */
    public String getCompanyCodeFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.get("companyCode", String.class);
    }

    /**
     * 4. 토큰 유효성 검증
     */
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