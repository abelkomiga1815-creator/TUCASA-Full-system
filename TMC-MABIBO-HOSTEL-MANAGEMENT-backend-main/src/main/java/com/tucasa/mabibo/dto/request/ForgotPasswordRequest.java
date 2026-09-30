package com.tucasa.mabibo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ForgotPasswordRequest {

    @NotBlank(message = "Email or phone number is required")
    @Size(max = 100)
    private String identifier; // email or phone number

    @NotNull(message = "Channel is required")
    private Channel channel;

    public enum Channel {
        EMAIL, SMS
    }
}