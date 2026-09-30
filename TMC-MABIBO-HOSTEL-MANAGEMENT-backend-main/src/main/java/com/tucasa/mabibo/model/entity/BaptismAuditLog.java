package com.tucasa.mabibo.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Immutable audit trail for the one-way baptism transition (false -> true).
 * Rows in this table are never updated or deleted.
 */
@Entity
@Table(name = "baptism_audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaptismAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private User member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_admin_id", nullable = false)
    private User changedByAdmin;

    @Column(name = "previous_status", nullable = false)
    private Boolean previousStatus;

    @Column(name = "new_status", nullable = false)
    @Builder.Default
    private Boolean newStatus = true;

    @Column(name = "baptism_date")
    private LocalDate baptismDate;

    @Column(name = "church_name", length = 150)
    private String churchName;

    @Column(length = 500)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
