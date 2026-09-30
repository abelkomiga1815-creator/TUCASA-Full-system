package com.tucasa.mabibo.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Only yearOfStudy, phone, and talent are editable during a semester
 * update. Home region, home church, and baptism status are deliberately
 * absent from this DTO - they are read-only on this endpoint by design.
 */
@Data
public class SemesterUpdateRequest {

    @NotNull
    @Min(1)
    @Max(7)
    private Short yearOfStudy;

    @NotNull
    @Pattern(regexp = "^\\+?[0-9]{9,15}$", message = "Phone must be a valid number")
    private String phone;

    @Size(max = 255)
    private String talent;
}
