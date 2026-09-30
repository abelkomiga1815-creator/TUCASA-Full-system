package com.tucasa.mabibo.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalMembers;
    private long activeMembers;
    private long alumniCount;
    private long suspendedCount;
    private long baptizedCount;
    private long pendingReports;
    private long pendingFeesCount;
    private Map<String, Long> membersByRole;
    private Map<String, Long> membersByYear;
}
