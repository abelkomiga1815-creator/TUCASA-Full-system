package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.model.entity.Announcement;
import com.tucasa.mabibo.model.entity.Event;
import com.tucasa.mabibo.model.entity.SpiritualMaterial;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Read-only content endpoints available to any authenticated member
 * (MEMBER, LEADER, or ADMIN), scoped to the caller's own branch.
 */
@RestController
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @GetMapping("/api/materials")
    public List<SpiritualMaterial> listMaterials(@AuthenticationPrincipal User currentUser) {
        return contentService.listMaterials(currentUser.getBranch().getId());
    }

    @GetMapping("/api/announcements")
    public List<Announcement> listAnnouncements(@AuthenticationPrincipal User currentUser) {
        return contentService.listActiveAnnouncements(currentUser.getBranch().getId());
    }

    @GetMapping("/api/events")
    public List<Event> listEvents(@AuthenticationPrincipal User currentUser) {
        return contentService.listUpcomingEvents(currentUser.getBranch().getId());
    }
}
