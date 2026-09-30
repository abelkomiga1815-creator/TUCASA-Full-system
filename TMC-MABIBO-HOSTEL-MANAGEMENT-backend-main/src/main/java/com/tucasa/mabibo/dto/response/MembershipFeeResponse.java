package com.tucasa.mabibo.dto.response;

import com.tucasa.mabibo.model.entity.MembershipFee;
import com.tucasa.mabibo.model.entity.Semester;
import com.tucasa.mabibo.model.entity.User;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class MembershipFeeResponse {

    private Long id;
    private UserInfo user;
    private SemesterInfo semester;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String paymentMethod;
    private String referenceNumber;
    private LocalDateTime paidAt;
    private UserInfo confirmedBy;
    private LocalDateTime confirmedAt;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MembershipFeeResponse fromEntity(MembershipFee f) {
        return MembershipFeeResponse.builder()
                .id(f.getId())
                .user(f.getUser() != null ? UserInfo.fromEntity(f.getUser()) : null)
                .semester(f.getSemester() != null ? SemesterInfo.fromEntity(f.getSemester()) : null)
                .amount(f.getAmount())
                .currency(f.getCurrency())
                .status(f.getStatus())
                .paymentMethod(f.getPaymentMethod())
                .referenceNumber(f.getReferenceNumber())
                .paidAt(f.getPaidAt())
                .confirmedBy(f.getConfirmedBy() != null ? UserInfo.fromEntity(f.getConfirmedBy()) : null)
                .confirmedAt(f.getConfirmedAt())
                .notes(f.getNotes())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }

    @Data
    @Builder
    public static class UserInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;

        public static UserInfo fromEntity(User u) {
            return UserInfo.builder()
                    .id(u.getId())
                    .firstName(u.getFirstName())
                    .lastName(u.getLastName())
                    .email(u.getEmail())
                    .build();
        }
    }

    @Data
    @Builder
    public static class SemesterInfo {
        private Long id;
        private String name;

        public static SemesterInfo fromEntity(Semester s) {
            return SemesterInfo.builder()
                    .id(s.getId())
                    .name(s.getName())
                    .build();
        }
    }
}
