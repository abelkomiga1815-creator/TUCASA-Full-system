package com.tucasa.mabibo.dto.request;

import com.tucasa.mabibo.model.enums.MaterialType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MaterialRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 1000)
    private String description;

    @NotNull
    private MaterialType type;

    @NotBlank
    @Size(max = 500)
    private String fileUrl;
}
