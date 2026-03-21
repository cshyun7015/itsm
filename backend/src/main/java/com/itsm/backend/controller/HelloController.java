package com.itsm.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
// 프론트엔드(localhost:3000)에서의 접근을 허용하는 CORS 설정입니다.
@CrossOrigin(origins = "http://localhost:3000")
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "ITIL v4 ITSM 시스템 백엔드와 정상적으로 연결되었습니다! 🎉";
    }
}
