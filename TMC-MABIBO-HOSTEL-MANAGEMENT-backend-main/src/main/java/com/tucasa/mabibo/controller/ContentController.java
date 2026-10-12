package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.model.entity.Announcement;
import com.tucasa.mabibo.model.entity.Event;
import com.tucasa.mabibo.model.entity.SpiritualMaterial;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only content endpoints available to any authenticated member
 * (MEMBER, LEADER, or ADMIN), scoped to the caller's own branch.
 */
@RestController
@RequiredArgsConstructor
public class ContentController {

    private static final int MAX_PAGE_SIZE = 100;

    private final ContentService contentService;

    @GetMapping("/api/materials")
    public Page<SpiritualMaterial> listMaterials(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int page) {
        return contentService.listMaterials(currentUser.getBranch().getId(), pageable(page, limit));
    }

    @GetMapping("/api/announcements")
    public Page<Announcement> listAnnouncements(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int page) {
        return contentService.listActiveAnnouncements(currentUser.getBranch().getId(), pageable(page, limit));
    }

    @GetMapping("/api/events")
    public Page<Event> listEvents(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int page) {
        return contentService.listUpcomingEvents(currentUser.getBranch().getId(), pageable(page, limit));
    }

    private PageRequest pageable(int page, int limit) {
        int size = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);
        return PageRequest.of(Math.max(page, 0), size);
    }
}
