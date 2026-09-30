package com.tucasa.mabibo.dto.response;

import com.tucasa.mabibo.model.entity.LeaderPermission;
import com.tucasa.mabibo.model.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class LeaderPermissionResponse {

    private Long id;
    private UserInfo user;
    private Boolean canUploadMaterials;
    private Boolean canPostAnnouncements;
    private Boolean canCreateEvents;
    private UserInfo grantedBy;
    private LocalDateTime grantedAt;
    private LocalDateTime updatedAt;

    public static LeaderPermissionResponse fromEntity(LeaderPermission p) {
        return LeaderPermissionResponse.builder()
                .id(p.getId())
                .user(p.getUser() != null ? UserInfo.fromEntity(p.getUser()) : null)
                .canUploadMaterials(p.getCanUploadMaterials())
                .canPostAnnouncements(p.getCanPostAnnouncements())
                .canCreateEvents(p.getCanCreateEvents())
                .grantedBy(p.getGrantedBy() != null ? UserInfo.fromEntity(p.getGrantedBy()) : null)
                .grantedAt(p.getGrantedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    @Data
    @Builder
    public static class UserInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String role;

        public static UserInfo fromEntity(User u) {
            return UserInfo.builder()
                    .id(u.getId())
                    .firstName(u.getFirstName())
                    .lastName(u.getLastName())
                    .email(u.getEmail())
                    .role(u.getRole().name())
                    .build();
        }
    }
}