package com.tucasa.mabibo.service;

import com.tucasa.mabibo.dto.request.LeaderPermissionRequest;
import com.tucasa.mabibo.dto.response.LeaderPermissionResponse;
import com.tucasa.mabibo.exception.ResourceNotFoundException;
import com.tucasa.mabibo.model.entity.LeaderPermission;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.repository.LeaderPermissionRepository;
import com.tucasa.mabibo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderPermissionService {

    private final LeaderPermissionRepository permissionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public LeaderPermissionResponse getPermissions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LeaderPermission permission = permissionRepository.findByUser(user)
                .orElse(LeaderPermission.builder()
                        .user(user)
                        .canUploadMaterials(false)
                        .canPostAnnouncements(false)
                        .canCreateEvents(false)
                        .build());

        return LeaderPermissionResponse.fromEntity(permission);
    }

    @Transactional
    public LeaderPermissionResponse updatePermissions(Long userId, LeaderPermissionRequest request, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getRole().name().equals("LEADER") && !user.getRole().name().equals("ADMIN")) {
            throw new IllegalArgumentException("Permissions can only be set for leaders");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        LeaderPermission permission = permissionRepository.findByUser(user)
                .orElse(LeaderPermission.builder()
                        .user(user)
                        .grantedBy(admin)
                        .build());

        permission.setCanUploadMaterials(request.getCanUploadMaterials() != null && request.getCanUploadMaterials());
        permission.setCanPostAnnouncements(request.getCanPostAnnouncements() != null && request.getCanPostAnnouncements());
        permission.setCanCreateEvents(request.getCanCreateEvents() != null && request.getCanCreateEvents());
        permission.setGrantedBy(admin);

        permission = permissionRepository.save(permission);
        log.info("Admin {} updated permissions for user {}: materials={}, announcements={}, events={}",
                adminId, user.getEmail(), permission.getCanUploadMaterials(), permission.getCanPostAnnouncements(), permission.getCanCreateEvents());

        return LeaderPermissionResponse.fromEntity(permission);
    }

    @Transactional(readOnly = true)
    public boolean canUploadMaterials(Long userId) {
        return permissionRepository.findByUserId(userId)
                .map(LeaderPermission::getCanUploadMaterials)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean canPostAnnouncements(Long userId) {
        return permissionRepository.findByUserId(userId)
                .map(LeaderPermission::getCanPostAnnouncements)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean canCreateEvents(Long userId) {
        return permissionRepository.findByUserId(userId)
                .map(LeaderPermission::getCanCreateEvents)
                .orElse(false);
    }
}