package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.FeeBulkRequest;
import com.tucasa.mabibo.dto.request.FeeCreateRequest;
import com.tucasa.mabibo.dto.response.MembershipFeeResponse;
import com.tucasa.mabibo.model.entity.Semester;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.repository.SemesterRepository;
import com.tucasa.mabibo.service.MembershipFeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/fees")
@RequiredArgsConstructor
@Tag(name = "Admin - Membership Fees", description = "Create, confirm, waive and list membership fee records")
public class FeeAdminController {

    private final MembershipFeeService feeService;
    private final SemesterRepository semesterRepository;

    @GetMapping("/semesters")
    @Operation(summary = "List all semesters for fee forms")
    public ResponseEntity<List<Map<String, Object>>> listSemesters() {
        return ResponseEntity.ok(semesterRepository.findAll().stream()
                .sorted(Comparator.comparing(Semester::getId).reversed())
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", s.getId());
                    m.put("name", s.getName());
                    m.put("isActive", s.getIsActive());
                    return m;
                })
                .toList());
    }

    @GetMapping
    @Operation(summary = "List all fee records, optionally filtered by status and/or semester")
    public ResponseEntity<Page<MembershipFeeResponse>> listFees(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long semesterId,
            Pageable pageable) {
        return ResponseEntity.ok(feeService.listFees(status, semesterId, pageable));
    }

    @PostMapping
    @Operation(summary = "Create a PENDING fee record for a member")
    public ResponseEntity<MembershipFeeResponse> createFee(
            @AuthenticationPrincipal User currentAdmin,
            @Valid @RequestBody FeeCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(feeService.createFee(request, currentAdmin.getId()));
    }

    @PostMapping("/{id}/confirm")
    @Operation(summary = "Confirm a PENDING fee payment (status becomes PAID)")
    public ResponseEntity<MembershipFeeResponse> confirmFee(
            @AuthenticationPrincipal User currentAdmin,
            @PathVariable Long id) {
        return ResponseEntity.ok(feeService.confirmFee(id, currentAdmin.getId()));
    }

    @PostMapping("/{id}/waive")
    @Operation(summary = "Waive a PENDING fee (status becomes WAIVED, member is NOT counted active)")
    public ResponseEntity<MembershipFeeResponse> waiveFee(
            @AuthenticationPrincipal User currentAdmin,
            @PathVariable Long id) {
        return ResponseEntity.ok(feeService.waiveFee(id, currentAdmin.getId()));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Create PENDING fee records for all active branch members lacking one for the semester")
    public ResponseEntity<Map<String, Integer>> bulkCreate(
            @AuthenticationPrincipal User currentAdmin,
            @Valid @RequestBody FeeBulkRequest request) {
        int created = feeService.bulkCreate(request, currentAdmin.getBranch().getId(), currentAdmin.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("created", created));
    }
}
