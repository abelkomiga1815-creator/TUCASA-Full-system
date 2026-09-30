package com.tucasa.mabibo.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "alumni_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlumniRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_member_id")
    private User originalMember;

    @Column(name = "full_name", nullable = false, length = 160)
    private String fullName;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 15)
    private String phone;

    @Column(nullable = false, length = 100)
    private String university;

    @Column(nullable = false, length = 100)
    private String program;

    @Column(name = "final_year_of_study", nullable = false)
    private Short finalYearOfStudy;

    @Column(name = "home_region", nullable = false, length = 50)
    private String homeRegion;

    @Column(name = "home_church", nullable = false, length = 100)
    private String homeChurch;

    @Column(name = "graduation_year", nullable = false)
    private Short graduationYear;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "snapshot_data", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> snapshotData;

    @Column(name = "archived_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime archivedAt = LocalDateTime.now();
}
