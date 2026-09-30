package com.tucasa.mabibo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50)
    private String firstName;

    @Size(max = 50)
    private String middleName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @NotBlank
    @Pattern(regexp = "^\\+?[0-9]{9,15}$", message = "Phone must be a valid number")
    private String phone;

    @NotBlank
    @Size(max = 100)
    private String university;

    @NotBlank
    @Size(max = 100)
    private String program;

    @NotNull
    @Min(1)
    @Max(7)
    private Short yearOfStudy;

    @NotBlank
    @Size(max = 50)
    private String homeRegion;

    @NotBlank
    @Size(max = 100)
    private String homeChurch;

    @Size(max = 255)
    private String talent;

    @NotBlank
    @Size(min = 8, max = 100, message = "Password must be at least 8 characters")
    private String password;

    private MultipartFile profilePicture;

    // Optional self-declaration at registration. Absent/null means false.
    // After registration, baptism can only move false -> true via the
    // admin baptism endpoint (one-way rule, audit-logged).
    private Boolean isBaptized;
}