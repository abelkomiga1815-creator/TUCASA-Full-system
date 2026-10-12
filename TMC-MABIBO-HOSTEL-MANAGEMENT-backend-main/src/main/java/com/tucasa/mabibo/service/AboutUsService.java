package com.tucasa.mabibo.service;

import com.tucasa.mabibo.dto.request.AboutUsRequest;
import com.tucasa.mabibo.dto.response.AboutUsResponse;
import com.tucasa.mabibo.exception.ResourceNotFoundException;
import com.tucasa.mabibo.model.entity.AboutUs;
import com.tucasa.mabibo.repository.AboutUsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AboutUsService {

    private final AboutUsRepository aboutUsRepository;

    @Transactional(readOnly = true)
    public AboutUsResponse getAboutUs() {
        return aboutUsRepository.findFirstByOrderByIdAsc()
                .map(AboutUsResponse::fromEntity)
                .orElseGet(() -> AboutUsResponse.builder()
                        .title("About Us")
                        .description("")
                        .mission("")
                        .vision("")
                        .contactInformation("")
                        .organizationName("")
                        .branchName("")
                        .build());
    }

    @Transactional
    public AboutUsResponse updateAboutUs(AboutUsRequest request) {
        AboutUs aboutUs = aboutUsRepository.findFirstByOrderByIdAsc()
                .orElseGet(AboutUs::new);

        aboutUs.setTitle(request.getTitle());
        aboutUs.setDescription(request.getDescription());
        aboutUs.setMission(request.getMission());
        aboutUs.setVision(request.getVision());
        aboutUs.setContactInformation(request.getContactInformation());
        aboutUs.setOrganizationName(request.getOrganizationName());
        aboutUs.setBranchName(request.getBranchName());

        aboutUs = aboutUsRepository.save(aboutUs);
        return AboutUsResponse.fromEntity(aboutUs);
    }
}