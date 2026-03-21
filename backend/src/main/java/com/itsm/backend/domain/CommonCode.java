package com.itsm.backend.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class CommonCode {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String groupCode;  // 그룹 (예: PRIORITY, TICKET_STATUS)
    private String codeValue;  // 실제 값 (예: HIGH, IN_PROGRESS)
    private String codeName;   // 화면 표시명 (예: 높음, 진행 중)
    private String description;// 설명

    private String useYn = "Y"; // 사용 여부 (Y/N)
}
