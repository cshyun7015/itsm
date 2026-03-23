package com.itsm.backend.security;

import com.itsm.backend.domain.User;
import com.itsm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// 🌟 1. 트랜잭션 임포트 추가
import org.springframework.transaction.annotation.Transactional;
import jakarta.annotation.Nonnull;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Nonnull
    @Transactional(readOnly = true) // 🌟 2. DB 연결을 유지해주는 핵심 어노테이션 추가!
    public UserDetails loadUserByUsername(@Nonnull String username) throws UsernameNotFoundException {
        // 1. DB에서 유저 정보를 가져옵니다.
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // 🌟 2. 핵심 변경! Spring Security의 기본 User가 아닌,
        // 고객사 정보(companyCode)를 품고 있는 'UserPrincipal'을 반환합니다!
        return new UserPrincipal(user);
    }
}