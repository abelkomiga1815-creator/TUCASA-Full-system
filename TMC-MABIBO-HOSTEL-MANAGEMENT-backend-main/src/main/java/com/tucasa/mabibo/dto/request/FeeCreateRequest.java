package com.tucasa.mabibo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FeeCreateRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    /**
     * Optional. When absent, the currently active semester is used when one
     * exists; otherwise the record is created without a semester.
     */
    private Long semesterId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be positive")
    @Digits(integer = 8, fraction = 2, message = "Amount must have at most 8 integer digits and 2 decimals")
    private BigDecimal amount;

    @Size(max = 10)
    private String currency;

    @Size(max = 50)
    private String paymentMethod;

    @Size(max = 100)
    private String referenceNumber;

    @Size(max = 2000)
    private String notes;
}
