package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.AdminResetPasswordRequest;
import com.tucasa.mabibo.dto.request.ChangePasswordRequest;
import com.tucasa.mabibo.dto.request.ForcedChangePasswordRequest;
import com.tucasa.mabibo.dto.request.LoginRequest;
import com.tucasa.mabibo.dto.request.RefreshTokenRequest;
import com.tucasa.mabibo.dto.request.RegisterRequest;
import com.tucasa.mabibo.dto.response.AuthResponse;
import com.tucasa.mabibo.dto.response.RegisterResponse;
import com.tucasa.mabibo.dto.response.UserResponse;
import com.tucasa.mabibo.exception.InvalidCredentialsException;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

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

    @PostMapping(value = "/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserResponse> updateProfilePicture(
            @AuthenticationPrincipal User currentUser,
            @RequestPart("profilePicture") MultipartFile profilePicture) {
        return ResponseEntity.ok(authService.updateProfilePicture(currentUser.getId(), profilePicture));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(requireAuthenticated(currentUser).getId(), request);
        return ResponseEntity.ok().build();
    }

    /**
     * Forced password change used right after an admin-issued temporary
     * password: only the new password and its confirmation are submitted, the
     * temporary password itself is never re-sent. The session is restricted to
     * this endpoint while mustChangePassword is true (see JwtAuthenticationFilter).
     */
    @PostMapping("/forced-change-password")
    public ResponseEntity<Map<String, String>> forcedChangePassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ForcedChangePasswordRequest request) {
        String message = authService.forcedChangePassword(requireAuthenticated(currentUser), request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    private User requireAuthenticated(User currentUser) {
        if (currentUser == null || currentUser.getId() == null) {
            throw new InvalidCredentialsException("Authentication is required to change the password");
        }
        return currentUser;
    }

    @PostMapping("/admin/reset-password/{userId}")
    public ResponseEntity<UserResponse> adminResetPassword(
            @PathVariable Long userId,
            @Valid @RequestBody AdminResetPasswordRequest request) {
        return ResponseEntity.ok(authService.adminResetPassword(userId, request));
    }
}
