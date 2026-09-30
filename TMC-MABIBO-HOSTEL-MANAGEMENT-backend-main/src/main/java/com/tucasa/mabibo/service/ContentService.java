package com.tucasa.mabibo.service;

import com.tucasa.mabibo.model.entity.Announcement;
import com.tucasa.mabibo.model.entity.Event;
import com.tucasa.mabibo.model.entity.SpiritualMaterial;
import com.tucasa.mabibo.repository.AnnouncementRepository;
import com.tucasa.mabibo.repository.EventRepository;
import com.tucasa.mabibo.repository.SpiritualMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final SpiritualMaterialRepository materialRepository;
    private final AnnouncementRepository announcementRepository;
    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public List<SpiritualMaterial> listMaterials(Short branchId) {
        return materialRepository.findByBranchIdOrderByCreatedAtDesc(branchId);
    }

    @Transactional(readOnly = true)
    public List<Announcement> listActiveAnnouncements(Short branchId) {
        return announcementRepository.findActiveByBranch(branchId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<Event> listUpcomingEvents(Short branchId) {
        return eventRepository.findUpcomingByBranch(branchId, LocalDateTime.now());
    }
}
