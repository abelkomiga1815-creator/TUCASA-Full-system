package com.tucasa.mabibo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PositionRequest {

    @NotBlank(message = "Position name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @Size(max = 2000)
    private String responsibilities;

    @NotNull(message = "Level is required")
    @Min(1)
    @Max(5)
    private Short level;

    @Size(max = 50)
    private String departmentTag;
}