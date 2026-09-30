package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.SpiritualMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpiritualMaterialRepository extends JpaRepository<SpiritualMaterial, Long> {
    List<SpiritualMaterial> findByBranchIdOrderByCreatedAtDesc(Short branchId);
}
