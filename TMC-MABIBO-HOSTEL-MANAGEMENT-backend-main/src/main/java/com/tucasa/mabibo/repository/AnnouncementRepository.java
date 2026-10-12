package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.Announcement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("""
            SELECT a FROM Announcement a
            WHERE a.branch.id = :branchId
              AND (a.expiryAt IS NULL OR a.expiryAt > :now)
            ORDER BY a.createdAt DESC
            """)
    List<Announcement> findActiveByBranch(@Param("branchId") Short branchId, @Param("now") LocalDateTime now);

    @Query(value = """
            SELECT a FROM Announcement a
            WHERE a.branch.id = :branchId
              AND (a.expiryAt IS NULL OR a.expiryAt > :now)
            ORDER BY a.createdAt DESC
            """,
            countQuery = """
            SELECT COUNT(a) FROM Announcement a
            WHERE a.branch.id = :branchId
              AND (a.expiryAt IS NULL OR a.expiryAt > :now)
            """)
    Page<Announcement> findActiveByBranch(@Param("branchId") Short branchId, @Param("now") LocalDateTime now, Pageable pageable);
}
