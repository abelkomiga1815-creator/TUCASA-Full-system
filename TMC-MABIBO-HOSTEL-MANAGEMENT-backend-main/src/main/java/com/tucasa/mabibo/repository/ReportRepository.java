package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.Report;
import com.tucasa.mabibo.model.enums.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByBranchIdAndStatus(Short branchId, ReportStatus status);
}
