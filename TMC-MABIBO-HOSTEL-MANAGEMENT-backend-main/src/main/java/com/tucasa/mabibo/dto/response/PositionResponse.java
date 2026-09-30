package com.tucasa.mabibo.dto.response;

import com.tucasa.mabibo.model.entity.Position;
import com.tucasa.mabibo.model.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PositionResponse {

    private Long id;
    private String name;
    private String description;
    private String responsibilities;
    private Short level;
    private String departmentTag;
    private Boolean isRetired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LeaderInfo leader;

    public static PositionResponse fromEntity(Position p, User leader) {
        return PositionResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .responsibilities(p.getResponsibilities())
                .level(p.getLevel())
                .departmentTag(p.getDepartmentTag())
                .isRetired(p.getIsRetired())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .leader(leader != null ? LeaderInfo.fromEntity(leader) : null)
                .build();
    }

    @Data
    @Builder
    public static class LeaderInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String profilePicUrl;

        public static LeaderInfo fromEntity(User u) {
            return LeaderInfo.builder()
                    .id(u.getId())
                    .firstName(u.getFirstName())
                    .lastName(u.getLastName())
                    .profilePicUrl(u.getProfilePicUrl())
                    .build();
        }
    }
}