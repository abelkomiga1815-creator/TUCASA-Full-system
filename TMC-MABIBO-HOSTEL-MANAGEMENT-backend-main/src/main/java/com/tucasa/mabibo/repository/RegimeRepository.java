package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.Regime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegimeRepository extends JpaRepository<Regime, Long> {

    Optional<Regime> findByIsActiveTrue();

    List<Regime> findAllByOrderByStartDateDesc();

    Optional<Regime> findByName(String name);
}