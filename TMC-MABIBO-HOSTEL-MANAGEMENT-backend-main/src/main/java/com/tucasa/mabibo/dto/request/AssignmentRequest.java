package com.tucasa.mabibo.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignmentRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Position ID is required")
    private Long positionId;

    @NotNull(message = "Regime ID is required")
    private Long regimeId;
}