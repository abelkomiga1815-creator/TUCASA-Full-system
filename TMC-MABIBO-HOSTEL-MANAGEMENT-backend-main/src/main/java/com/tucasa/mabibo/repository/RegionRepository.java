package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, Short> {
    boolean existsByName(String name);
}
