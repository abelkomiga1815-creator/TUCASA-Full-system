package com.tucasa.mabibo.service;

import com.tucasa.mabibo.config.CacheConfig;
import com.tucasa.mabibo.dto.request.AnnouncementRequest;
import com.tucasa.mabibo.dto.request.EventRequest;
import com.tucasa.mabibo.dto.request.MaterialRequest;
import com.tucasa.mabibo.dto.request.ReportRequest;
import com.tucasa.mabibo.dto.response.ActiveCountResponse;
import com.tucasa.mabibo.exception.BusinessRuleViolationException;
import com.tucasa.mabibo.exception.ResourceNotFoundException;
import com.tucasa.mabibo.model.entity.*;
import com.tucasa.mabibo.model.enums.ReportStatus;
import com.tucasa.mabibo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LeaderService {

    private final SpiritualMaterialRepository materialRepository;
    private final AnnouncementRepository announcementRepository;
    private final EventRepository eventRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final SemesterRepository semesterRepository;
    private final BranchRepository branchRepository;
    private final LeaderPermissionService permissionService;

    @Transactional
    public SpiritualMaterial createMaterial(Long uploaderId, MaterialRequest request) {
        User uploader = findUser(uploaderId);
        checkPermission(uploaderId, "upload materials", () -> permissionService.canUploadMaterials(uploaderId));

        SpiritualMaterial material = SpiritualMaterial.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .type(request.getType())
                .fileUrl(request.getFileUrl())
                .branch(uploader.getBranch())
                .uploadedBy(uploader)
                .build();
        return materialRepository.save(material);
    }

    @Transactional
    public Announcement createAnnouncement(Long creatorId, AnnouncementRequest request) {
        User creator = findUser(creatorId);
        checkPermission(creatorId, "post announcements", () -> permissionService.canPostAnnouncements(creatorId));

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .branch(creator.getBranch())
                .createdBy(creator)
                .expiryAt(request.getExpiryAt())
                .build();
        return announcementRepository.save(announcement);
    }

    @Transactional
    public Event createEvent(Long creatorId, EventRequest request) {
        User creator = findUser(creatorId);
        checkPermission(creatorId, "create events", () -> permissionService.canCreateEvents(creatorId));

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .branch(creator.getBranch())
                .startsAt(request.getStartsAt())
                .endsAt(request.getEndsAt())
                .createdBy(creator)
                .build();
        return eventRepository.save(event);
    }

    @Transactional
    public Report createReport(Long submitterId, ReportRequest request) {
        User submitter = findUser(submitterId);
        Report report = Report.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .branch(submitter.getBranch())
                .submittedBy(submitter)
                .status(ReportStatus.PENDING)
                .build();
        return reportRepository.save(report);
    }

    private void checkPermission(Long userId, String action, java.util.function.BooleanSupplier permissionCheck) {
        User user = findUser(userId);
        if (user.getRole().name().equals("ADMIN")) {
            return; // Admins have all permissions
        }
        if (!permissionCheck.getAsBoolean()) {
            throw new BusinessRuleViolationException("You do not have permission to " + action + ". Contact an admin to request access.");
        }
    }

    /**
     * Active-count business rule, cached since it's a relatively expensive
     * aggregate query that leaders may poll frequently from a dashboard.
     */
    @Cacheable(value = CacheConfig.ACTIVE_MEMBERS_COUNT_CACHE, key = "#branchId")
    @Transactional(readOnly = true)
    public ActiveCountResponse getActiveMembersCount(Short branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
        Semester activeSemester = semesterRepository.findByIsActiveTrue()
                .orElseThrow(() -> new ResourceNotFoundException("No active semester is currently configured"));

        long count = userRepository.countActiveMembersForBranchAndSemester(branchId, activeSemester.getId());

        return ActiveCountResponse.builder()
                .branchId(branch.getId())
                .branchName(branch.getName())
                .semesterId(activeSemester.getId())
                .semesterName(activeSemester.getName())
                .count(count)
                .build();
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
