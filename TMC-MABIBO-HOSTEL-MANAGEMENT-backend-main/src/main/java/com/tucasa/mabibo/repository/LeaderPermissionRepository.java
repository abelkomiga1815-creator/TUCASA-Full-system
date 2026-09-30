package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.LeaderPermission;
import com.tucasa.mabibo.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeaderPermissionRepository extends JpaRepository<LeaderPermission, Long> {

    Optional<LeaderPermission> findByUser(User user);

    Optional<LeaderPermission> findByUserId(Long userId);

    boolean existsByUser(User user);
}