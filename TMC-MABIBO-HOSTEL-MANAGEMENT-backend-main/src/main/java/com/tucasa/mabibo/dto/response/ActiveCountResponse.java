package com.tucasa.mabibo.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActiveCountResponse {
    private Short branchId;
    private String branchName;
    private Long semesterId;
    private String semesterName;
    private long count;
}
