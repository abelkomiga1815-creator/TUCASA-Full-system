package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.LoginRequest;
import com.tucasa.mabibo.dto.request.RefreshTokenRequest;
import com.tucasa.mabibo.dto.request.RegisterRequest;
import com.tucasa.mabibo.dto.response.AuthResponse;
import com.tucasa.mabibo.dto.response.RegisterResponse;
import com.tucasa.mabibo.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RegisterResponse> register(
            @Valid @ModelAttribute RegisterRequest request,
            @RequestPart(value = "profilePicture", required = false) MultipartFile profilePicture) {
        request.setProfilePicture(profilePicture);
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }
}
