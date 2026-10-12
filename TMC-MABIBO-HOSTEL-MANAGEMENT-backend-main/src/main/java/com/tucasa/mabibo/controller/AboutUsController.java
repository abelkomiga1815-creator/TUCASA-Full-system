package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.AboutUsRequest;
import com.tucasa.mabibo.dto.response.AboutUsResponse;
import com.tucasa.mabibo.service.AboutUsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/about-us")
@RequiredArgsConstructor
public class AboutUsController {

    private final AboutUsService aboutUsService;

    @GetMapping
    public ResponseEntity<AboutUsResponse> getAboutUs() {
        return ResponseEntity.ok(aboutUsService.getAboutUs());
    }

    @PutMapping
    public ResponseEntity<AboutUsResponse> updateAboutUs(
            @AuthenticationPrincipal com.tucasa.mabibo.model.entity.User currentUser,
            @Valid @RequestBody AboutUsRequest request) {
        // Only ADMIN can update About Us
        if (!"ADMIN".equals(currentUser.getRole().name())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(aboutUsService.updateAboutUs(request));
    }
}