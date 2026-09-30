package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.AnnouncementRequest;
import com.tucasa.mabibo.dto.request.EventRequest;
import com.tucasa.mabibo.dto.request.MaterialRequest;
import com.tucasa.mabibo.dto.request.ReportRequest;
import com.tucasa.mabibo.dto.response.ActiveCountResponse;
import com.tucasa.mabibo.model.entity.Announcement;
import com.tucasa.mabibo.model.entity.Event;
import com.tucasa.mabibo.model.entity.Report;
import com.tucasa.mabibo.model.entity.SpiritualMaterial;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.service.LeaderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class LeaderController {

    private final LeaderService leaderService;

    @PostMapping("/api/leader/materials")
    public ResponseEntity<SpiritualMaterial> createMaterial(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody MaterialRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaderService.createMaterial(currentUser.getId(), request));
    }

    @PostMapping("/api/leader/announcements")
    public ResponseEntity<Announcement> createAnnouncement(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AnnouncementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaderService.createAnnouncement(currentUser.getId(), request));
    }

    @PostMapping("/api/leader/events")
    public ResponseEntity<Event> createEvent(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody EventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaderService.createEvent(currentUser.getId(), request));
    }

    @PostMapping("/api/leader/reports")
    public ResponseEntity<Report> createReport(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ReportRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(leaderService.createReport(currentUser.getId(), request));
    }

    @GetMapping("/api/leaders/active-count")
    public ActiveCountResponse getActiveCount(@AuthenticationPrincipal User currentUser) {
        return leaderService.getActiveMembersCount(currentUser.getBranch().getId());
    }
}
