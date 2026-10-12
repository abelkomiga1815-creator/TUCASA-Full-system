package com.tucasa.mabibo.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "about_us")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AboutUs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "mission", columnDefinition = "TEXT")
    private String mission;

    @Column(name = "vision", columnDefinition = "TEXT")
    private String vision;

    @Column(name = "contact_information", columnDefinition = "TEXT")
    private String contactInformation;

    @Column(name = "organization_name", length = 200)
    private String organizationName;

    @Column(name = "branch_name", length = 200)
    private String branchName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}