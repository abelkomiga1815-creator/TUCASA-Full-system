package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.AlumniRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AlumniRecordRepository extends JpaRepository<AlumniRecord, Long> {

    @Query("""
            SELECT a FROM AlumniRecord a
            WHERE (:name IS NULL OR LOWER(a.fullName) LIKE :name)
              AND (:graduationYear IS NULL OR a.graduationYear = :graduationYear)
              AND (:university IS NULL OR LOWER(a.university) LIKE :university)
            """)
    Page<AlumniRecord> search(
            @Param("name") String namePattern,
            @Param("graduationYear") Short graduationYear,
            @Param("university") String universityPattern,
            Pageable pageable);
}
