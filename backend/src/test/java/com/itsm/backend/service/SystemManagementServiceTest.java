package com.itsm.backend.service;

import com.itsm.backend.domain.*;
import com.itsm.backend.dto.*;
import com.itsm.backend.repository.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SystemManagementServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private UserService userService;

    @Mock private CompanyRepository companyRepository;
    @InjectMocks private CompanyService companyService;

    @Mock private CommonCodeRepository codeRepository;
    @InjectMocks private CommonCodeService codeService;

    @Test
    @DisplayName("사용자(User) 생성 테스트 (암호화 확인)")
    void createUserTest() {
        UserDto dto = new UserDto();
        dto.setUsername("testUser");
        dto.setPassword("1234");
        dto.setRole(Role.ROLE_USER);

        User user = new User();
        user.setUsername("testUser");
        user.setPassword("encoded_1234");

        when(userRepository.findByUsername("testUser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("1234")).thenReturn("encoded_1234");
        when(userRepository.save(any(User.class))).thenReturn(user);

        User result = userService.createUser(dto);
        assertEquals("testUser", result.getUsername());
        assertEquals("encoded_1234", result.getPassword());
    }

    @Test
    @DisplayName("고객사(Company) 수정 테스트")
    void updateCompanyTest() {
        Company existing = new Company();
        existing.setId(1L);
        existing.setName("구글코리아");

        CompanyDto dto = new CompanyDto();
        dto.setName("구글코리아(수정)");

        when(companyRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(companyRepository.save(any(Company.class))).thenReturn(existing);

        Company result = companyService.updateCompany(1L, dto);
        assertEquals("구글코리아(수정)", result.getName());
    }

    @Test
    @DisplayName("공통 코드(CommonCode) 삭제 테스트")
    void deleteCodeTest() {
        codeService.deleteCode(1L);
        verify(codeRepository, times(1)).deleteById(1L);
    }
}