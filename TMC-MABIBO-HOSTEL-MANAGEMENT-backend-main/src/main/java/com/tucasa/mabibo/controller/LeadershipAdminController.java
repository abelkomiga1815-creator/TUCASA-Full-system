package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.PositionRequest;
import com.tucasa.mabibo.dto.request.RegimeRequest;
import com.tucasa.mabibo.dto.request.AssignmentRequest;
import com.tucasa.mabibo.dto.response.PositionResponse;
import com.tucasa.mabibo.dto.response.RegimeResponse;
import com.tucasa.mabibo.dto.response.AssignmentResponse;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.service.LeadershipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class LeadershipAdminController {

    private final LeadershipService leadershipService;

    private Long getCurrentUserId(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof User user) {
            return user.getId();
        }
        throw new IllegalStateException("Authenticated principal is not a system user");
    }

    // ==================== POSITIONS ====================

    @PostMapping("/positions")
    public ResponseEntity<PositionResponse> createPosition(@Valid @RequestBody PositionRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leadershipService.createPosition(request, getCurrentUserId(auth)));
    }

    @PutMapping("/positions/{id}")
    public ResponseEntity<PositionResponse> updatePosition(@PathVariable Long id, @Valid @RequestBody PositionRequest request, Authentication auth) {
        return ResponseEntity.ok(leadershipService.updatePosition(id, request, getCurrentUserId(auth)));
    }

    @DeleteMapping("/positions/{id}")
    public ResponseEntity<Void> retirePosition(@PathVariable Long id, Authentication auth) {
        leadershipService.retirePosition(id, getCurrentUserId(auth));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/positions")
    public ResponseEntity<List<PositionResponse>> getAllPositions() {
        return ResponseEntity.ok(leadershipService.getAllPositions());
    }

    // ==================== REGIMES ====================

    @PostMapping("/regimes")
    public ResponseEntity<RegimeResponse> createRegime(@Valid @RequestBody RegimeRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leadershipService.createRegime(request, getCurrentUserId(auth)));
    }

    @PutMapping("/regimes/{id}")
    public ResponseEntity<RegimeResponse> updateRegime(@PathVariable Long id, @Valid @RequestBody RegimeRequest request, Authentication auth) {
        return ResponseEntity.ok(leadershipService.updateRegime(id, request, getCurrentUserId(auth)));
    }

    @PostMapping("/regimes/{id}/activate")
    public ResponseEntity<Void> setActiveRegime(@PathVariable Long id, Authentication auth) {
        leadershipService.setActiveRegime(id, getCurrentUserId(auth));
        return ResponseEntity.ok().build();
    }

    @GetMapping("/regimes")
    public ResponseEntity<List<RegimeResponse>> getAllRegimes() {
        return ResponseEntity.ok(leadershipService.getAllRegimes());
    }

    // ==================== ASSIGNMENTS ====================

    @PostMapping("/assignments")
    public ResponseEntity<AssignmentResponse> assignUser(@Valid @RequestBody AssignmentRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leadershipService.assignUser(request, getCurrentUserId(auth)));
    }

    @PutMapping("/assignments/{id}")
    public ResponseEntity<AssignmentResponse> updateAssignment(@PathVariable Long id, @RequestParam Long userId, Authentication auth) {
        return ResponseEntity.ok(leadershipService.updateAssignment(id, userId, getCurrentUserId(auth)));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<AssignmentResponse>> getAllAssignments() {
        return ResponseEntity.ok(leadershipService.getAllAssignments());
    }
}