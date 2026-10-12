package com.tucasa.mabibo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Payload of the forced password change performed right after an admin-issued
 * temporary password. No current/temporary password is required: the caller has
 * already proven ownership of the temporary password during login.
 */
@Data
public class ForcedChangePasswordRequest {

    @NotBlank(message = "New password is required")
    @Size(min = 8, message = "New password must be at least 8 characters")
    private String newPassword;

    @NotBlank(message = "Confirm new password is required")
    private String confirmNewPassword;
}
