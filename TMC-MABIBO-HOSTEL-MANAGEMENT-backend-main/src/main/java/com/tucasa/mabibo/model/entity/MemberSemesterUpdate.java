package com.tucasa.mabibo.model.entity;

import com.tucasa.mabibo.model.enums.RegistrationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "member_semester_updates",
        uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "semester_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberSemesterUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private User member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id", nullable = false)
    private Semester semester;

    @Column(name = "year_of_study", nullable = false)
    private Short yearOfStudy;

    @Column(nullable = false, length = 100)
    private String program;

    @Column(nullable = false, length = 15)
    private String phone;

    @Column(length = 255)
    private String talent;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_status", nullable = false, length = 20)
    @Builder.Default
    private RegistrationStatus registrationStatus = RegistrationStatus.CONFIRMED;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
