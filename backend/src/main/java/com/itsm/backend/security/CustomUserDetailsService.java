package com.itsm.backend.security;

import com.itsm.backend.domain.User;
import com.itsm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import jakarta.annotation.Nonnull;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Nonnull // 🌟 반환값(UserDetails)도 절대 Null이 아님을 선언!
    public UserDetails loadUserByUsername(@Nonnull String username) throws UsernameNotFoundException {
        // DB에서 유저를 찾고, 없으면 에러를 던집니다.
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + username));

        // Spring Security가 이해할 수 있는 UserDetails 객체로 변환해서 돌려줍니다.
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }
}