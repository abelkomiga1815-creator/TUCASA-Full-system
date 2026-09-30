package com.tucasa.mabibo.dto.response;

import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.model.enums.Role;
import com.tucasa.mabibo.model.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RegisterResponse {

    private Long id;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;
    private String phone;
    private String university;
    private String program;
    private Short yearOfStudy;
    private Boolean isBaptized;
    private String homeRegion;
    private String homeChurch;
    private String talent;
    private Role role;
    private UserStatus status;
    private Short branchId;
    private String branchName;
    private String profilePicUrl;
    private LocalDateTime createdAt;

    public static RegisterResponse fromEntity(User u) {
        return RegisterResponse.builder()
                .id(u.getId())
                .firstName(u.getFirstName())
                .middleName(u.getMiddleName())
                .lastName(u.getLastName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .university(u.getUniversity())
                .program(u.getProgram())
                .yearOfStudy(u.getYearOfStudy())
                .isBaptized(u.getIsBaptized())
                .homeRegion(u.getHomeRegion())
                .homeChurch(u.getHomeChurch())
                .talent(u.getTalent())
                .role(u.getRole())
                .status(u.getStatus())
                .branchId(u.getBranch() != null ? u.getBranch().getId() : null)
                .branchName(u.getBranch() != null ? u.getBranch().getName() : null)
                .profilePicUrl(u.getProfilePicUrl())
                .createdAt(u.getCreatedAt())
                .build();
    }
}