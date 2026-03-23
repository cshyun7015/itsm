package com.itsm.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import jakarta.annotation.Nonnull;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            // 🌟 프론트에서 넘어온 토큰을 눈으로 확인하기 위한 CCTV 로그 추가!!
            System.out.println("요청 URL: " + request.getRequestURI());
            System.out.println("받은 토큰: " + jwt);

            // 1. 토큰이 존재하고, 유효성 검증을 통과했다면
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
                // 2. 토큰에서 아이디(username) 추출
                String username = tokenProvider.getUsernameFromToken(jwt);

                // 🌟 3. 앞서 수정한 서비스에서 UserPrincipal 객체를 가져옴
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                // 4. SecurityContext에 "이 사용자는 정상적으로 인증되었음!" 하고 도장을 찍어줍니다.
                // 이제 컨트롤러 어디서든 SecurityContextHolder를 통해 UserPrincipal(고객사 코드 포함)을 꺼내 쓸 수 있습니다.
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            logger.error("Security Context에 사용자 인증을 설정할 수 없습니다", ex);
        }

        filterChain.doFilter(request, response);
    }

    // HTTP 헤더에서 "Bearer " 뒷부분의 토큰만 추출하는 헬퍼 메서드
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}