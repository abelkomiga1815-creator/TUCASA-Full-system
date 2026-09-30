package com.tucasa.mabibo.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "leader_permissions", uniqueConstraints = @UniqueConstraint(name = "uq_leader_permissions_user", columnNames = {"user_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "can_upload_materials", nullable = false)
    @Builder.Default
    private Boolean canUploadMaterials = false;

    @Column(name = "can_post_announcements", nullable = false)
    @Builder.Default
    private Boolean canPostAnnouncements = false;

    @Column(name = "can_create_events", nullable = false)
    @Builder.Default
    private Boolean canCreateEvents = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "granted_by", nullable = false)
    private User grantedBy;

    @CreationTimestamp
    @Column(name = "granted_at", nullable = false, updatable = false)
    private LocalDateTime grantedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}