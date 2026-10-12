package com.tucasa.mabibo.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tucasa.mabibo.model.enums.Role;
import com.tucasa.mabibo.model.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Core user aggregate. Note: LEADER and ADMIN roles are ALSO members
 * (role inheritance is enforced logically - every user row, regardless
 * of role, participates in semester updates unless status = ALUMNI).
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @Column(name = "middle_name", length = 50)
    private String middleName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 15)
    private String phone;

    @Column(nullable = false, length = 100)
    private String university;

    @Column(nullable = false, length = 100)
    private String program;

    @Column(name = "year_of_study", nullable = false)
    private Short yearOfStudy;

    @Column(name = "is_baptized", nullable = false)
    @Builder.Default
    private Boolean isBaptized = false;

    @Column(name = "home_region", nullable = false, length = 50)
    private String homeRegion;

    @Column(name = "home_church", nullable = false, length = 100)
    private String homeChurch;

    @Column(length = 255)
    private String talent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "profile_pic_url", length = 500)
    private String profilePicUrl;

    @Column(name = "must_change_password", nullable = false)
    @Builder.Default
    private Boolean mustChangePassword = false;

    @Column(name = "email_verified_at")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public String getFullName() {
        StringBuilder sb = new StringBuilder(firstName);
        if (middleName != null && !middleName.isBlank()) {
            sb.append(" ").append(middleName);
        }
        sb.append(" ").append(lastName);
        return sb.toString();
    }

    // ---------------------------------------------------------------
    // Spring Security UserDetails contract
    // ---------------------------------------------------------------

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Role inheritance for authorization purposes: ADMIN implies LEADER
        // and MEMBER privileges; LEADER implies MEMBER privileges.
        return switch (role) {
            case ADMIN -> List.of(
                    new SimpleGrantedAuthority("ADMIN"),
                    new SimpleGrantedAuthority("LEADER"),
                    new SimpleGrantedAuthority("MEMBER"));
            case LEADER -> List.of(
                    new SimpleGrantedAuthority("LEADER"),
                    new SimpleGrantedAuthority("MEMBER"));
            case MEMBER -> List.of(new SimpleGrantedAuthority("MEMBER"));
        };
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return status != UserStatus.SUSPENDED;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return status != UserStatus.SUSPENDED;
    }
}
