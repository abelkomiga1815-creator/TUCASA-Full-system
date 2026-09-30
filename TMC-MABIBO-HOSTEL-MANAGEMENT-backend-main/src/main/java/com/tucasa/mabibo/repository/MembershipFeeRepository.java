package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.MembershipFee;
import com.tucasa.mabibo.model.entity.Semester;
import com.tucasa.mabibo.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MembershipFeeRepository extends JpaRepository<MembershipFee, Long> {

    List<MembershipFee> findByUserOrderByCreatedAtDesc(User user);

    Page<MembershipFee> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<MembershipFee> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<MembershipFee> findBySemesterOrderByCreatedAtDesc(Semester semester, Pageable pageable);

    Page<MembershipFee> findBySemesterAndStatusOrderByCreatedAtDesc(Semester semester, String status, Pageable pageable);

    long countByStatus(String status);

    long countBySemesterAndStatus(Semester semester, String status);

    boolean existsByUserAndSemester(User user, Semester semester);

    /**
     * Distinct members with a PAID fee for the given semester.
     */
    @Query("""
            SELECT COUNT(DISTINCT f.user) FROM MembershipFee f
            WHERE f.semester = :semester AND f.status = 'PAID'
            """)
    long countActiveMembersForSemester(@Param("semester") Semester semester);

    /**
     * ACTIVE users in a branch that have no fee record at all for the semester
     * (bulk-create candidates).
     */
    @Query("""
            SELECT u FROM User u
            WHERE u.status = com.tucasa.mabibo.model.enums.UserStatus.ACTIVE
              AND u.branch.id = :branchId
              AND NOT EXISTS (
                  SELECT 1 FROM MembershipFee f
                  WHERE f.user = u AND f.semester = :semester
              )
            ORDER BY u.id ASC
            """)
    List<User> findActiveUsersWithoutFeeForSemester(
            @Param("branchId") Short branchId,
            @Param("semester") Semester semester);
}
