package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.LeaderPermissionRequest;
import com.tucasa.mabibo.dto.response.LeaderPermissionResponse;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.service.LeaderPermissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/leaders")
@RequiredArgsConstructor
public class LeaderPermissionController {

    private final LeaderPermissionService permissionService;

    private Long getCurrentUserId(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof User user) {
            return user.getId();
        }
        throw new IllegalStateException("Authenticated principal is not a system user");
    }

    @GetMapping("/{id}/permissions")
    public ResponseEntity<LeaderPermissionResponse> getPermissions(@PathVariable Long id) {
        return ResponseEntity.ok(permissionService.getPermissions(id));
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<LeaderPermissionResponse> updatePermissions(@PathVariable Long id, @Valid @RequestBody LeaderPermissionRequest request, Authentication auth) {
        return ResponseEntity.ok(permissionService.updatePermissions(id, request, getCurrentUserId(auth)));
    }
}