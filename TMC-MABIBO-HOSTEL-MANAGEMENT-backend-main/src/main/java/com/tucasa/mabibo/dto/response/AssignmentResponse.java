package com.tucasa.mabibo.dto.response;

import com.tucasa.mabibo.model.entity.LeadershipAssignment;
import com.tucasa.mabibo.model.entity.Position;
import com.tucasa.mabibo.model.entity.Regime;
import com.tucasa.mabibo.model.entity.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AssignmentResponse {

    private Long id;
    private UserInfo user;
    private PositionInfo position;
    private RegimeInfo regime;
    private LocalDateTime assignedAt;
    private UserInfo assignedBy;
    private Boolean isCurrent;

    public static AssignmentResponse fromEntity(LeadershipAssignment a) {
        return AssignmentResponse.builder()
                .id(a.getId())
                .user(a.getUser() != null ? UserInfo.fromEntity(a.getUser()) : null)
                .position(a.getPosition() != null ? PositionInfo.fromEntity(a.getPosition()) : null)
                .regime(a.getRegime() != null ? RegimeInfo.fromEntity(a.getRegime()) : null)
                .assignedAt(a.getAssignedAt())
                .assignedBy(a.getAssignedBy() != null ? UserInfo.fromEntity(a.getAssignedBy()) : null)
                .isCurrent(a.getIsCurrent())
                .build();
    }

    @Data
    @Builder
    public static class UserInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;

        public static UserInfo fromEntity(User u) {
            return UserInfo.builder()
                    .id(u.getId())
                    .firstName(u.getFirstName())
                    .lastName(u.getLastName())
                    .email(u.getEmail())
                    .build();
        }
    }

    @Data
    @Builder
    public static class PositionInfo {
        private Long id;
        private String name;
        private Short level;

        public static PositionInfo fromEntity(Position p) {
            return PositionInfo.builder()
                    .id(p.getId())
                    .name(p.getName())
                    .level(p.getLevel())
                    .build();
        }
    }

    @Data
    @Builder
    public static class RegimeInfo {
        private Long id;
        private String name;

        public static RegimeInfo fromEntity(Regime r) {
            return RegimeInfo.builder()
                    .id(r.getId())
                    .name(r.getName())
                    .build();
        }
    }
}