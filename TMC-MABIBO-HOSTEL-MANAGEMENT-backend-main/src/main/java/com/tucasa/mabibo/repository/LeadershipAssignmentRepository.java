package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.LeadershipAssignment;
import com.tucasa.mabibo.model.entity.Regime;
import com.tucasa.mabibo.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadershipAssignmentRepository extends JpaRepository<LeadershipAssignment, Long> {

    List<LeadershipAssignment> findByRegimeAndIsCurrentTrueOrderByPositionLevelAsc(Regime regime);

    List<LeadershipAssignment> findByUserAndIsCurrentTrue(User user);

    @Query("SELECT a FROM LeadershipAssignment a WHERE a.regime.isActive = true AND a.isCurrent = true ORDER BY a.position.level ASC")
    List<LeadershipAssignment> findCurrentAssignments();

    @Query("SELECT a FROM LeadershipAssignment a WHERE a.regime.isActive = false AND a.isCurrent = true ORDER BY a.regime.startDate DESC, a.position.level ASC")
    List<LeadershipAssignment> findPastAssignments();

    @Query("SELECT a FROM LeadershipAssignment a WHERE a.user = :user AND a.position.id = :positionId AND a.regime.id = :regimeId")
    Optional<LeadershipAssignment> findByUserAndPositionAndRegime(User user, Long positionId, Long regimeId);
}