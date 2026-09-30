package com.tucasa.mabibo.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SystemController {

    @GetMapping("/")
    public Map<String, String> root() {
        return Map.of(
                "name", "TUCASA UDSM MABIBO HOSTEL Backend",
                "status", "UP",
                "frontend", "http://localhost:5173");
    }
}