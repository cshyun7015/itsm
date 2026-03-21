package com.itsm.backend.repository;

import com.itsm.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 🌟 Spring Security 로그인을 위해 꼭 필요한 메서드
    Optional<User> findByUsername(String username);

}