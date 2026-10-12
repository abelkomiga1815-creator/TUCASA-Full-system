package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.BaptizeRequest;
import com.tucasa.mabibo.dto.request.RoleChangeRequest;
import com.tucasa.mabibo.dto.request.AdminResetPasswordRequest;
import com.tucasa.mabibo.dto.response.DashboardStatsResponse;
import com.tucasa.mabibo.dto.response.UserResponse;
import com.tucasa.mabibo.exception.BusinessRuleViolationException;
import com.tucasa.mabibo.exception.ResourceNotFoundException;
import com.tucasa.mabibo.model.entity.AlumniRecord;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.model.enums.Role;
import com.tucasa.mabibo.model.enums.UserStatus;
import com.tucasa.mabibo.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

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

    @PostMapping("/members/export")
    public ResponseEntity<Resource> exportSelectedMembers(
            @AuthenticationPrincipal User currentUser,
            @RequestBody List<Long> memberIds) throws IOException {
        Short branchId = currentUser.getBranch().getId();
        byte[] excelData = adminService.exportMembers(memberIds);

        String filename = "TUCASA_Member_Details_" + LocalDate.now() + ".xlsx";
        ByteArrayResource resource = new ByteArrayResource(excelData);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelData.length)
                .body(resource);
    }

    @GetMapping("/members/export/all")
    public ResponseEntity<Resource> exportAllMembers(
            @AuthenticationPrincipal User currentUser) throws IOException {
        Short branchId = currentUser.getBranch().getId();
        byte[] excelData = adminService.exportAllMembers(currentUser.getBranch().getId());

        String filename = "TUCASA_All_Members_" + LocalDate.now() + ".xlsx";
        ByteArrayResource resource = new ByteArrayResource(excelData);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelData.length)
                .body(resource);
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

    @PutMapping("/members/{id}/reset-password")
    public UserResponse adminResetPassword(
            @PathVariable Long id,
            @Valid @RequestBody AdminResetPasswordRequest request) {
        return adminService.adminResetPassword(id, request);
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