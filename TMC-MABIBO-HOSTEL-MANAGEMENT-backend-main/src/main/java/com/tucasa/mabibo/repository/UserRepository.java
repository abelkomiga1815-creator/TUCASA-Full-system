package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.model.enums.Role;
import com.tucasa.mabibo.model.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<User> findByPhone(String phone);

    @Query("""
            SELECT u FROM User u
            WHERE u.branch.id = :branchId
              AND (:role IS NULL OR u.role = :role)
              AND (:status IS NULL OR u.status = :status)
              AND (:yearOfStudy IS NULL OR u.yearOfStudy = :yearOfStudy)
            """)
    Page<User> searchMembers(
            @Param("branchId") Short branchId,
            @Param("role") Role role,
            @Param("status") UserStatus status,
            @Param("yearOfStudy") Short yearOfStudy,
            Pageable pageable);

    /**
     * Active-count business rule: users with status = ACTIVE who have a
     * member_semester_updates record for the currently active semester,
     * filterable by branch.
     */
    @Query("""
            SELECT COUNT(DISTINCT u) FROM User u
            JOIN MemberSemesterUpdate msu ON msu.member.id = u.id
            WHERE u.status = com.tucasa.mabibo.model.enums.UserStatus.ACTIVE
              AND u.branch.id = :branchId
              AND msu.semester.id = :semesterId
            """)
    long countActiveMembersForBranchAndSemester(
            @Param("branchId") Short branchId,
            @Param("semesterId") Long semesterId);

    long countByBranchIdAndStatus(Short branchId, UserStatus status);

    long countByBranchIdAndRole(Short branchId, Role role);

    long countByBranchIdAndIsBaptized(Short branchId, boolean isBaptized);

    List<User> findByBranchIdOrderByCreatedAtDesc(Short branchId);
}
