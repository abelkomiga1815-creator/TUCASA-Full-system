package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BranchRepository extends JpaRepository<Branch, Short> {
    Optional<Branch> findByName(String name);
}
