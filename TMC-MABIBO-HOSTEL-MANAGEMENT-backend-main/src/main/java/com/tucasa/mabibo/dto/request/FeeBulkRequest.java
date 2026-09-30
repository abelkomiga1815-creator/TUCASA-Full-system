package com.tucasa.mabibo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FeeBulkRequest {

    @NotNull(message = "Semester ID is required")
    private Long semesterId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    @Digits(integer = 8, fraction = 2, message = "Amount must have at most 8 integer digits and 2 decimals")
    private BigDecimal amount;

    @Size(max = 10)
    private String currency;

    @Size(max = 2000)
    private String notes;
}
