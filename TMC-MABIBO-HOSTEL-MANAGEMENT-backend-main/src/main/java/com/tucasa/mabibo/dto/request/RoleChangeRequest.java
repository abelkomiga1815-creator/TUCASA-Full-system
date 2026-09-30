package com.tucasa.mabibo.dto.request;

import com.tucasa.mabibo.model.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleChangeRequest {

    @NotNull
    private Role role;
}
