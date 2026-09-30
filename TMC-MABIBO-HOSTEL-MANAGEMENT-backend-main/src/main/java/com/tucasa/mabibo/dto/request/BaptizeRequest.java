package com.tucasa.mabibo.dto.request;

import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BaptizeRequest {

    @PastOrPresent
    private LocalDate baptismDate;

    @Size(max = 150)
    private String churchName;

    @Size(max = 500)
    private String notes;
}
