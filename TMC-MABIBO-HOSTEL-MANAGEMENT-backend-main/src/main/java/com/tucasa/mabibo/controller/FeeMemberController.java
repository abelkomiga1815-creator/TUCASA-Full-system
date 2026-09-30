package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.response.MembershipFeeResponse;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.service.MembershipFeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members/fees")
@RequiredArgsConstructor
@Tag(name = "Member - Membership Fees", description = "View own membership fee records")
public class FeeMemberController {

    private final MembershipFeeService feeService;

    @GetMapping("/me")
    @Operation(summary = "List the current member's own fee records, newest first")
    public ResponseEntity<List<MembershipFeeResponse>> myFees(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(feeService.myFees(currentUser.getId()));
    }
}
