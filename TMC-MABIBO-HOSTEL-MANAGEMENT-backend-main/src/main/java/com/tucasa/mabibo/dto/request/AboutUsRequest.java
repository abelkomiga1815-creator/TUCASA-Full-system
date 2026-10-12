package com.tucasa.mabibo.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AboutUsRequest {

    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String description;

    private String mission;

    private String vision;

    @Size(max = 2000, message = "Contact information must not exceed 2000 characters")
    private String contactInformation;

    @Size(max = 200, message = "Organization name must not exceed 200 characters")
    private String organizationName;

    @Size(max = 200, message = "Branch name must not exceed 200 characters")
    private String branchName;
}