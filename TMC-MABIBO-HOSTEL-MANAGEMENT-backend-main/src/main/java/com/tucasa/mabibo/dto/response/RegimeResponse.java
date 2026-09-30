package com.tucasa.mabibo.dto.response;

import com.tucasa.mabibo.model.entity.Regime;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RegimeResponse {

    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<PositionWithLeader> leaders;

    public static RegimeResponse fromEntity(Regime r, List<PositionWithLeader> leaders) {
        return RegimeResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .isActive(r.getIsActive())
                .createdAt(r.getCreatedAt())
                .leaders(leaders)
                .build();
    }

    @Data
    @Builder
    public static class PositionWithLeader {
        private Long positionId;
        private String positionName;
        private Short level;
        private String departmentTag;
        private LeaderInfo leader;

        @Data
        @Builder
        public static class LeaderInfo {
            private Long id;
            private String firstName;
            private String lastName;
            private String profilePicUrl;
        }
    }
}