package com.tucasa.mabibo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminResetPasswordRequest {

    @NotBlank(message = "Temporary password is required")
    @Size(min = 8, message = "Temporary password must be at least 8 characters")
    private String temporaryPassword;

    @NotBlank(message = "Confirm temporary password is required")
    private String confirmTemporaryPassword;
}