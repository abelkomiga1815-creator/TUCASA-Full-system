package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.ForgotPasswordRequest;
import com.tucasa.mabibo.dto.request.ResetPasswordRequest;
import com.tucasa.mabibo.service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth - Password Reset", description = "Password reset via email/SMS OTP")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset OTP via email or SMS")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        // Always return 200 to prevent user enumeration
        passwordResetService.requestReset(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Verify OTP and reset password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.verifyAndReset(request);
        return ResponseEntity.ok().build();
    }
}