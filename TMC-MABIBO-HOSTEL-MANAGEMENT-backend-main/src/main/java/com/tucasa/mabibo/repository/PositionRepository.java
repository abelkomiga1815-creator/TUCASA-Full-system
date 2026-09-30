package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PositionRepository extends JpaRepository<Position, Long> {

    List<Position> findByIsRetiredFalseOrderByLevelAscNameAsc();

    @Query("SELECT p FROM Position p WHERE p.isRetired = false ORDER BY p.level ASC, p.name ASC")
    List<Position> findActiveOrderByLevel();

    boolean existsByName(String name);
}