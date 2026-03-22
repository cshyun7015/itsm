package com.itsm.backend.dto;
import com.itsm.backend.domain.Role;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
public class UserDto {
    private String username;
    private String name;
    private String department;
    private String password; // 생성 시 필수, 수정 시 빈 값이면 변경 안함
    private Role role;
    private String status;
}
