package com.itsm.backend.dto;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
public class CommonCodeDto {
    private String groupCode;
    private String codeValue;
    private String codeName;
    private String description;
    private String useYn;
}