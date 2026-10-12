package com.tucasa.mabibo.service;

import com.tucasa.mabibo.dto.request.BaptizeRequest;
import com.tucasa.mabibo.dto.request.RoleChangeRequest;
import com.tucasa.mabibo.dto.request.AdminResetPasswordRequest;
import com.tucasa.mabibo.dto.response.DashboardStatsResponse;
import com.tucasa.mabibo.dto.response.UserResponse;
import com.tucasa.mabibo.exception.BusinessRuleViolationException;
import com.tucasa.mabibo.exception.ResourceNotFoundException;
import com.tucasa.mabibo.model.entity.*;
import com.tucasa.mabibo.model.enums.Role;
import com.tucasa.mabibo.model.enums.UserStatus;
import com.tucasa.mabibo.repository.*;
import com.tucasa.mabibo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final BaptismAuditLogRepository baptismAuditLogRepository;
    private final AlumniRecordRepository alumniRecordRepository;
    private final ReportRepository reportRepository;
    private final MembershipFeeRepository feeRepository;
    private final SemesterRepository semesterRepository;
    private final EmailService emailService;
    private final AuthService authService;
    private final MemberExportService memberExportService;

    @Transactional(readOnly = true)
    public Page<UserResponse> searchMembers(Short branchId, Role role, UserStatus status, Short yearOfStudy, Pageable pageable) {
        return userRepository.searchMembers(branchId, role, status, yearOfStudy, pageable)
                .map(UserResponse::fromEntity);
    }

    @Transactional
    public UserResponse changeRole(Long memberId, RoleChangeRequest request) {
        User user = findUser(memberId);

        if (user.getStatus() == UserStatus.ALUMNI) {
            throw new BusinessRuleViolationException("Cannot change the role of an alumnus");
        }

        user.setRole(request.getRole());
        userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse adminResetPassword(Long memberId, AdminResetPasswordRequest request) {
        User member = findUser(memberId);
        return authService.adminResetPassword(memberId, request);
    }

    /**
     * Core baptism rule: strictly one-way (false -> true). Only an ADMIN may
     * call this. Attempting to baptize an already-baptized member is
     * rejected with 400. Every successful transition is logged immutably.
     */
    @Transactional
    public UserResponse baptizeMember(Long memberId, Long adminId, BaptizeRequest request) {
        User member = findUser(memberId);
        User admin = findUser(adminId);

        if (Boolean.TRUE.equals(member.getIsBaptized())) {
            throw new BusinessRuleViolationException("This member is already baptized; baptism status cannot be changed once true");
        }

        boolean previousStatus = member.getIsBaptized();
        member.setIsBaptized(true);
        userRepository.save(member);

        BaptismAuditLog log = BaptismAuditLog.builder()
                .member(member)
                .changedByAdmin(admin)
                .previousStatus(previousStatus)
                .newStatus(true)
                .baptismDate(request.getBaptismDate() != null ? request.getBaptismDate() : LocalDate.now())
                .churchName(request.getChurchName())
                .notes(request.getNotes())
                .build();
        baptismAuditLogRepository.save(log);

        emailService.sendBaptismConfirmationEmail(member.getEmail(), member.getFullName());

        return UserResponse.fromEntity(member);
    }

    /**
     * Graduation / alumni archiving: snapshot the member's current details
     * into alumni_records, flip status to ALUMNI. Once archived, the member
     * can no longer perform semester updates or be promoted/demoted.
     */
    @Transactional
    public UserResponse graduateMember(Long memberId) {
        User member = findUser(memberId);

        if (member.getStatus() == UserStatus.ALUMNI) {
            throw new BusinessRuleViolationException("This member has already graduated");
        }

        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("id", member.getId());
        snapshot.put("firstName", member.getFirstName());
        snapshot.put("middleName", member.getMiddleName());
        snapshot.put("lastName", member.getLastName());
        snapshot.put("email", member.getEmail());
        snapshot.put("phone", member.getPhone());
        snapshot.put("university", member.getUniversity());
        snapshot.put("program", member.getProgram());
        snapshot.put("yearOfStudy", member.getYearOfStudy());
        snapshot.put("isBaptized", member.getIsBaptized());
        snapshot.put("homeRegion", member.getHomeRegion());
        snapshot.put("homeChurch", member.getHomeChurch());
        snapshot.put("talent", member.getTalent());
        snapshot.put("role", member.getRole().name());
        snapshot.put("branchId", member.getBranch().getId());
        snapshot.put("branchName", member.getBranch().getName());

        AlumniRecord record = AlumniRecord.builder()
                .originalMember(member)
                .fullName(member.getFullName())
                .email(member.getEmail())
                .phone(member.getPhone())
                .university(member.getUniversity())
                .program(member.getProgram())
                .finalYearOfStudy(member.getYearOfStudy())
                .homeRegion(member.getHomeRegion())
                .homeChurch(member.getHomeChurch())
                .graduationYear((short) Year.now().getValue())
                .snapshotData(snapshot)
                .build();

        alumniRecordRepository.save(record);

        member.setStatus(UserStatus.ALUMNI);
        userRepository.save(member);

        emailService.sendGraduationEmail(member.getEmail(), member.getFullName());

        return UserResponse.fromEntity(member);
    }

    @Transactional(readOnly = true)
    public Page<AlumniRecord> searchAlumni(String name, Short graduationYear, String university, Pageable pageable) {
        return alumniRecordRepository.search(name, graduationYear, university, pageable);
    }

    @Transactional
    public void approveReport(Long reportId, Long adminId, boolean approve) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found"));
        User admin = findUser(adminId);

        report.setStatus(approve ? com.tucasa.mabibo.model.enums.ReportStatus.APPROVED
                : com.tucasa.mabibo.model.enums.ReportStatus.REJECTED);
        report.setReviewedBy(admin);
        report.setReviewedAt(LocalDateTime.now());
        reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats(Short branchId) {
        long total = userRepository.countByBranchIdAndStatus(branchId, UserStatus.ACTIVE)
                + userRepository.countByBranchIdAndStatus(branchId, UserStatus.SUSPENDED)
                + userRepository.countByBranchIdAndStatus(branchId, UserStatus.ALUMNI);
        long alumni = userRepository.countByBranchIdAndStatus(branchId, UserStatus.ALUMNI);
        long suspended = userRepository.countByBranchIdAndStatus(branchId, UserStatus.SUSPENDED);

        // Active member = has a PAID membership fee for the current semester.
        // Pending fees = PENDING records for the current semester (or all
        // PENDING records when no semester is active).
        long active;
        long pendingFees;
        java.util.Optional<Semester> activeSemester = semesterRepository.findByIsActiveTrue();
        if (activeSemester.isPresent()) {
            active = feeRepository.countActiveMembersForSemester(activeSemester.get());
            pendingFees = feeRepository.countBySemesterAndStatus(
                    activeSemester.get(), MembershipFee.STATUS_PENDING);
        } else {
            active = 0;
            pendingFees = feeRepository.countByStatus(MembershipFee.STATUS_PENDING);
        }

        long baptized = userRepository.countByBranchIdAndIsBaptized(branchId, true);

        Map<String, Long> byRole = new LinkedHashMap<>();
        for (Role r : Role.values()) {
            byRole.put(r.name(), userRepository.countByBranchIdAndRole(branchId, r));
        }

        return DashboardStatsResponse.builder()
                .totalMembers(total)
                .activeMembers(active)
                .alumniCount(alumni)
                .suspendedCount(suspended)
                .baptizedCount(baptized)
                .pendingReports(reportRepository.findByBranchIdAndStatus(branchId, com.tucasa.mabibo.model.enums.ReportStatus.PENDING).size())
                .pendingFeesCount(pendingFees)
                .membersByRole(byRole)
                .membersByYear(Map.of())
                .build();
    }

    /**
     * Export selected members to Excel workbook.
     */
    public byte[] exportMembers(List<Long> memberIds) throws IOException {
        return memberExportService.exportMembers(memberIds);
    }

    /**
     * Export all members for a branch to Excel workbook.
     */
    public byte[] exportAllMembers(Short branchId) throws IOException {
        return memberExportService.exportAllMembers(branchId);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
