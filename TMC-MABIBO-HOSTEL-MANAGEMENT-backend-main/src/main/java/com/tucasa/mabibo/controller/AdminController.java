package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.BaptizeRequest;
import com.tucasa.mabibo.dto.request.RoleChangeRequest;
import com.tucasa.mabibo.dto.response.DashboardStatsResponse;
import com.tucasa.mabibo.dto.response.UserResponse;
import com.tucasa.mabibo.model.entity.AlumniRecord;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.model.enums.Role;
import com.tucasa.mabibo.model.enums.UserStatus;
import com.tucasa.mabibo.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/members")
    public Page<UserResponse> searchMembers(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) Short yearOfStudy,
            Pageable pageable) {
        return adminService.searchMembers(currentUser.getBranch().getId(), role, status, yearOfStudy, pageable);
    }

    @PutMapping("/members/{id}/role")
    public UserResponse changeRole(@PathVariable Long id, @Valid @RequestBody RoleChangeRequest request) {
        return adminService.changeRole(id, request);
    }

    @PutMapping("/members/{id}/baptize")
    public UserResponse baptizeMember(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentAdmin,
            @Valid @RequestBody BaptizeRequest request) {
        return adminService.baptizeMember(id, currentAdmin.getId(), request);
    }

    @PostMapping("/members/{id}/graduate")
    public UserResponse graduateMember(@PathVariable Long id) {
        return adminService.graduateMember(id);
    }

    @GetMapping("/alumni")
    public Page<AlumniRecord> searchAlumni(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Short graduationYear,
            @RequestParam(required = false) String university,
            Pageable pageable) {
        String namePattern = (name != null && !name.isBlank()) ? "%" + name.toLowerCase() + "%" : null;
        String universityPattern = (university != null && !university.isBlank()) ? "%" + university.toLowerCase() + "%" : null;
        return adminService.searchAlumni(namePattern, graduationYear, universityPattern, pageable);
    }

    @PutMapping("/reports/{id}/approve")
    public ResponseEntity<Void> approveReport(@PathVariable Long id, @AuthenticationPrincipal User currentAdmin) {
        adminService.approveReport(id, currentAdmin.getId(), true);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/dashboard/stats")
    public DashboardStatsResponse getDashboardStats(@AuthenticationPrincipal User currentUser) {
        return adminService.getDashboardStats(currentUser.getBranch().getId());
    }
}
