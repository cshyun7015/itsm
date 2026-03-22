package com.itsm.backend.service;

import com.itsm.backend.domain.Role;
import com.itsm.backend.domain.User;
import com.itsm.backend.dto.UserDto;
import com.itsm.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Security Config에 등록된 빈 사용

    @Transactional(readOnly = true)
    public Page<User> getUsers(int page, int size, String sort, String dir, String username, String name, String dept, Role role) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(dir), sort));
        return userRepository.searchUsers(username, name, dept, role, pageable);
    }

    @Transactional
    public User createUser(UserDto dto) {
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setName(dto.getName());
        user.setDepartment(dto.getDepartment());
        user.setRole(dto.getRole());
        user.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        user.setPassword(passwordEncoder.encode(dto.getPassword())); // 비밀번호 암호화
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, UserDto dto) {
        User user = userRepository.findById(id).orElseThrow();
        user.setName(dto.getName());
        user.setDepartment(dto.getDepartment());
        user.setRole(dto.getRole());
        user.setStatus(dto.getStatus());
        // 비밀번호가 입력되었을 때만 암호화하여 업데이트
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) { userRepository.deleteById(id); }
}