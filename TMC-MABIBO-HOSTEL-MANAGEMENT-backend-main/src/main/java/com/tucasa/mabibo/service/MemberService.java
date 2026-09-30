package com.tucasa.mabibo.service;

import com.tucasa.mabibo.dto.request.SemesterUpdateRequest;
import com.tucasa.mabibo.dto.response.UserResponse;
import com.tucasa.mabibo.exception.BusinessRuleViolationException;
import com.tucasa.mabibo.exception.ResourceNotFoundException;
import com.tucasa.mabibo.model.entity.MemberSemesterUpdate;
import com.tucasa.mabibo.model.entity.Semester;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.model.enums.RegistrationStatus;
import com.tucasa.mabibo.model.enums.UserStatus;
import com.tucasa.mabibo.repository.MemberSemesterUpdateRepository;
import com.tucasa.mabibo.repository.SemesterRepository;
import com.tucasa.mabibo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final UserRepository userRepository;
    private final SemesterRepository semesterRepository;
    private final MemberSemesterUpdateRepository semesterUpdateRepository;

    @Transactional(readOnly = true)
    public UserResponse getCurrentProfile(Long userId) {
        User user = findUser(userId);
        return UserResponse.fromEntity(user);
    }

    /**
     * Semester update business rule: regardless of role (MEMBER, LEADER, or
     * ADMIN - all of whom are "members" for this purpose), only
     * yearOfStudy, phone, and talent may change here. Home region, home
     * church, and baptism status are never touched by this endpoint.
     * ALUMNI may not perform semester updates at all.
     */
    @Transactional
    public UserResponse updateSemesterDetails(Long userId, SemesterUpdateRequest request) {
        User user = findUser(userId);

        if (user.getStatus() == UserStatus.ALUMNI) {
            throw new BusinessRuleViolationException("Alumni cannot perform semester updates");
        }
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new BusinessRuleViolationException("Suspended members cannot perform semester updates");
        }

        Semester activeSemester = semesterRepository.findByIsActiveTrue()
                .orElseThrow(() -> new ResourceNotFoundException("No active semester is currently configured"));

        // Update the mutable fields on the user record itself.
        user.setYearOfStudy(request.getYearOfStudy());
        user.setPhone(request.getPhone());
        user.setTalent(request.getTalent());
        userRepository.save(user);

        // Upsert the per-semester snapshot record (unique on member+semester).
        MemberSemesterUpdate update = semesterUpdateRepository
                .findByMemberIdAndSemesterId(userId, activeSemester.getId())
                .orElseGet(() -> MemberSemesterUpdate.builder()
                        .member(user)
                        .semester(activeSemester)
                        .build());

        update.setYearOfStudy(request.getYearOfStudy());
        update.setProgram(user.getProgram());
        update.setPhone(request.getPhone());
        update.setTalent(request.getTalent());
        update.setRegistrationStatus(RegistrationStatus.CONFIRMED);

        semesterUpdateRepository.save(update);

        return UserResponse.fromEntity(user);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
