package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.AboutUs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AboutUsRepository extends JpaRepository<AboutUs, Long> {

    Optional<AboutUs> findFirstByOrderByIdAsc();
}