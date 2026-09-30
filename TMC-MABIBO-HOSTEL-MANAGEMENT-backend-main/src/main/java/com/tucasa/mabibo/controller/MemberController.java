package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.SemesterUpdateRequest;
import com.tucasa.mabibo.dto.response.UserResponse;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/me")
    public UserResponse getCurrentProfile(@AuthenticationPrincipal User currentUser) {
        return memberService.getCurrentProfile(currentUser.getId());
    }

    @PutMapping("/update-semester")
    public UserResponse updateSemesterDetails(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody SemesterUpdateRequest request) {
        return memberService.updateSemesterDetails(currentUser.getId(), request);
    }
}

