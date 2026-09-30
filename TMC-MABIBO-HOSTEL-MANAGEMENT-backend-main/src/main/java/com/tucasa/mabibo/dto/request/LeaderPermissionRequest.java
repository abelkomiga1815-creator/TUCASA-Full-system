package com.tucasa.mabibo.dto.request;

import lombok.Data;

@Data
public class LeaderPermissionRequest {

    private Boolean canUploadMaterials = false;
    private Boolean canPostAnnouncements = false;
    private Boolean canCreateEvents = false;
}