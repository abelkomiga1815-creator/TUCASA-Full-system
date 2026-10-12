package com.tucasa.mabibo.service;

import com.tucasa.mabibo.model.entity.Announcement;
import com.tucasa.mabibo.model.entity.Event;
import com.tucasa.mabibo.model.entity.SpiritualMaterial;
import com.tucasa.mabibo.repository.AnnouncementRepository;
import com.tucasa.mabibo.repository.EventRepository;
import com.tucasa.mabibo.repository.SpiritualMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ContentService {

    private final SpiritualMaterialRepository materialRepository;
    private final AnnouncementRepository announcementRepository;
    private final EventRepository eventRepository;

    @Transactional(readOnly = true)
    public Page<SpiritualMaterial> listMaterials(Short branchId, Pageable pageable) {
        return materialRepository.findByBranchId(branchId, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Announcement> listActiveAnnouncements(Short branchId, Pageable pageable) {
        return announcementRepository.findActiveByBranch(branchId, LocalDateTime.now(), pageable);
    }

    @Transactional(readOnly = true)
    public Page<Event> listUpcomingEvents(Short branchId, Pageable pageable) {
        return eventRepository.findUpcomingByBranch(branchId, LocalDateTime.now(), pageable);
    }
}
