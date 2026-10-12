package com.tucasa.mabibo.dto.response;

import com.tucasa.mabibo.model.entity.AboutUs;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AboutUsResponse {

    private Long id;
    private String title;
    private String description;
    private String mission;
    private String vision;
    private String contactInformation;
    private String organizationName;
    private String branchName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AboutUsResponse fromEntity(AboutUs a) {
        return AboutUsResponse.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .mission(a.getMission())
                .vision(a.getVision())
                .contactInformation(a.getContactInformation())
                .organizationName(a.getOrganizationName())
                .branchName(a.getBranchName())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}