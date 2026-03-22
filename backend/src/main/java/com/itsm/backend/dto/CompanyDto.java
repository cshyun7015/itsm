package com.itsm.backend.dto;
import lombok.Getter; import lombok.Setter;

@Getter @Setter
public class CompanyDto {
    private String name;
    private String address;
    private String code;
    private String domain;
    private String managerName;
}