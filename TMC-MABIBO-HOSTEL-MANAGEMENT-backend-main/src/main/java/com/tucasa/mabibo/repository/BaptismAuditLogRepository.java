package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.BaptismAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BaptismAuditLogRepository extends JpaRepository<BaptismAuditLog, Long> {
    List<BaptismAuditLog> findByMemberIdOrderByCreatedAtDesc(Long memberId);
}
