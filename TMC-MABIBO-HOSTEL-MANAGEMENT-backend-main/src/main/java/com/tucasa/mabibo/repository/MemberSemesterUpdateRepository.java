package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.MemberSemesterUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberSemesterUpdateRepository extends JpaRepository<MemberSemesterUpdate, Long> {
    Optional<MemberSemesterUpdate> findByMemberIdAndSemesterId(Long memberId, Long semesterId);
}
