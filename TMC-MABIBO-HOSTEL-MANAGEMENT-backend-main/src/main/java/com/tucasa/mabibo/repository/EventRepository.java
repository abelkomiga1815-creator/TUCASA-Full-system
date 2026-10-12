package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    @Query("""
            SELECT e FROM Event e
            WHERE e.branch.id = :branchId AND e.startsAt >= :now
            ORDER BY e.startsAt ASC
            """)
    List<Event> findUpcomingByBranch(@Param("branchId") Short branchId, @Param("now") LocalDateTime now);

    @Query(value = """
            SELECT e FROM Event e
            WHERE e.branch.id = :branchId AND e.startsAt >= :now
            ORDER BY e.startsAt ASC
            """,
            countQuery = """
            SELECT COUNT(e) FROM Event e
            WHERE e.branch.id = :branchId AND e.startsAt >= :now
            """)
    Page<Event> findUpcomingByBranch(@Param("branchId") Short branchId, @Param("now") LocalDateTime now, Pageable pageable);
}
