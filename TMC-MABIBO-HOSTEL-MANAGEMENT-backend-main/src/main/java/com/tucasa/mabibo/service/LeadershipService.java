package com.tucasa.mabibo.service;

import com.tucasa.mabibo.dto.request.AssignmentRequest;
import com.tucasa.mabibo.dto.request.PositionRequest;
import com.tucasa.mabibo.dto.request.RegimeRequest;
import com.tucasa.mabibo.dto.response.AssignmentResponse;
import com.tucasa.mabibo.dto.response.PositionResponse;
import com.tucasa.mabibo.dto.response.RegimeResponse;
import com.tucasa.mabibo.exception.BusinessRuleViolationException;
import com.tucasa.mabibo.exception.DuplicateResourceException;
import com.tucasa.mabibo.exception.ResourceNotFoundException;
import com.tucasa.mabibo.model.entity.LeadershipAssignment;
import com.tucasa.mabibo.model.entity.Position;
import com.tucasa.mabibo.model.entity.Regime;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.repository.LeadershipAssignmentRepository;
import com.tucasa.mabibo.repository.PositionRepository;
import com.tucasa.mabibo.repository.RegimeRepository;
import com.tucasa.mabibo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeadershipService {

    private final PositionRepository positionRepository;
    private final RegimeRepository regimeRepository;
    private final LeadershipAssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    // ==================== POSITIONS ====================

    @Transactional
    public PositionResponse createPosition(PositionRequest request, Long adminId) {
        if (positionRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("A position with this name already exists");
        }

        Position position = Position.builder()
                .name(request.getName())
                .description(request.getDescription())
                .responsibilities(request.getResponsibilities())
                .level(request.getLevel())
                .departmentTag(request.getDepartmentTag())
                .isRetired(false)
                .build();

        position = positionRepository.save(position);
        log.info("Admin {} created position: {}", adminId, position.getName());

        return PositionResponse.fromEntity(position, null);
    }

    @Transactional
    public PositionResponse updatePosition(Long id, PositionRequest request, Long adminId) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position not found"));

        if (!position.getName().equals(request.getName()) && positionRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("A position with this name already exists");
        }

        position.setName(request.getName());
        position.setDescription(request.getDescription());
        position.setResponsibilities(request.getResponsibilities());
        position.setLevel(request.getLevel());
        position.setDepartmentTag(request.getDepartmentTag());

        position = positionRepository.save(position);
        log.info("Admin {} updated position: {}", adminId, position.getName());

        return PositionResponse.fromEntity(position, null);
    }

    @Transactional
    public void retirePosition(Long id, Long adminId) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position not found"));

        // Check if position has active assignments
        boolean hasActiveAssignments = assignmentRepository.findByRegimeAndIsCurrentTrueOrderByPositionLevelAsc(
                        regimeRepository.findByIsActiveTrue().orElse(null))
                .stream()
                .anyMatch(a -> a.getPosition().getId().equals(id));

        if (hasActiveAssignments) {
            throw new BusinessRuleViolationException("Cannot retire position with active assignments in current regime");
        }

        position.setIsRetired(true);
        positionRepository.save(position);
        log.info("Admin {} retired position: {}", adminId, position.getName());
    }

    @Transactional(readOnly = true)
    public List<PositionResponse> getAllPositions() {
        List<Position> positions = positionRepository.findActiveOrderByLevel();
        Regime activeRegime = regimeRepository.findByIsActiveTrue().orElse(null);

        return positions.stream()
                .map(p -> {
                    User leader = null;
                    if (activeRegime != null) {
                        leader = assignmentRepository.findByRegimeAndIsCurrentTrueOrderByPositionLevelAsc(activeRegime)
                                .stream()
                                .filter(a -> a.getPosition().getId().equals(p.getId()))
                                .findFirst()
                                .map(LeadershipAssignment::getUser)
                                .orElse(null);
                    }
                    return PositionResponse.fromEntity(p, leader);
                })
                .collect(Collectors.toList());
    }

    // ==================== REGIMES ====================

    @Transactional
    public RegimeResponse createRegime(RegimeRequest request, Long adminId) {
        if (regimeRepository.findByName(request.getName()).isPresent()) {
            throw new DuplicateResourceException("A regime with this name already exists");
        }

        Regime activeRegime = regimeRepository.findByIsActiveTrue().orElse(null);
        if (activeRegime != null) {
            // Archive current regime
            activeRegime.setIsActive(false);
            regimeRepository.save(activeRegime);
            regimeRepository.flush(); // Flush to release the unique constraint on is_active
            log.info("Admin {} archived regime: {}", adminId, activeRegime.getName());
        }

        Regime regime = Regime.builder()
                .name(request.getName())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .isActive(true)
                .build();

        regime = regimeRepository.save(regime);
        log.info("Admin {} created regime: {}", adminId, regime.getName());

        return buildRegimeResponse(regime);
    }

    @Transactional
    public RegimeResponse updateRegime(Long id, RegimeRequest request, Long adminId) {
        Regime regime = regimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Regime not found"));

        if (regime.getIsActive()) {
            throw new BusinessRuleViolationException("Cannot modify active regime. Archive it first.");
        }

        if (!regime.getName().equals(request.getName()) && regimeRepository.findByName(request.getName()).isPresent()) {
            throw new DuplicateResourceException("A regime with this name already exists");
        }

        regime.setName(request.getName());
        regime.setStartDate(request.getStartDate());
        regime.setEndDate(request.getEndDate());
        regime = regimeRepository.save(regime);

        log.info("Admin {} updated regime: {}", adminId, regime.getName());
        return buildRegimeResponse(regime);
    }

    @Transactional
    public void setActiveRegime(Long id, Long adminId) {
        Regime newActive = regimeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Regime not found"));

        if (newActive.getIsActive()) {
            throw new BusinessRuleViolationException("Regime is already active");
        }

        Regime currentActive = regimeRepository.findByIsActiveTrue().orElse(null);
        if (currentActive != null) {
            currentActive.setIsActive(false);
            regimeRepository.save(currentActive);
        }

        newActive.setIsActive(true);
        regimeRepository.save(newActive);

        log.info("Admin {} set active regime to: {}", adminId, newActive.getName());
    }

    @Transactional(readOnly = true)
    public List<RegimeResponse> getAllRegimes() {
        List<Regime> regimes = regimeRepository.findAllByOrderByStartDateDesc();
        return regimes.stream().map(this::buildRegimeResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RegimeResponse getCurrentRegime() {
        Regime regime = regimeRepository.findByIsActiveTrue()
                .orElseThrow(() -> new ResourceNotFoundException("No active regime found"));
        return buildRegimeResponse(regime);
    }

    @Transactional(readOnly = true)
    public List<RegimeResponse> getPastRegimes() {
        return regimeRepository.findAllByOrderByStartDateDesc()
                .stream()
                .filter(r -> !r.getIsActive())
                .map(this::buildRegimeResponse)
                .collect(Collectors.toList());
    }

    private RegimeResponse buildRegimeResponse(Regime regime) {
        List<LeadershipAssignment> assignments = assignmentRepository.findByRegimeAndIsCurrentTrueOrderByPositionLevelAsc(regime);

        List<RegimeResponse.PositionWithLeader> leaders = assignments.stream()
                .map(a -> RegimeResponse.PositionWithLeader.builder()
                        .positionId(a.getPosition().getId())
                        .positionName(a.getPosition().getName())
                        .level(a.getPosition().getLevel())
                        .departmentTag(a.getPosition().getDepartmentTag())
                        .leader(a.getUser() != null ? RegimeResponse.PositionWithLeader.LeaderInfo.builder()
                                .id(a.getUser().getId())
                                .firstName(a.getUser().getFirstName())
                                .lastName(a.getUser().getLastName())
                                .profilePicUrl(a.getUser().getProfilePicUrl())
                                .build() : null)
                        .build())
                .collect(Collectors.toList());

        return RegimeResponse.fromEntity(regime, leaders);
    }

    // ==================== ASSIGNMENTS ====================

    @Transactional
    public AssignmentResponse assignUser(AssignmentRequest request, Long adminId) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Position position = positionRepository.findById(request.getPositionId())
                .orElseThrow(() -> new ResourceNotFoundException("Position not found"));
        Regime regime = regimeRepository.findById(request.getRegimeId())
                .orElseThrow(() -> new ResourceNotFoundException("Regime not found"));

        // Check if user already has this position in this regime
        if (assignmentRepository.findByUserAndPositionAndRegime(user, position.getId(), regime.getId()).isPresent()) {
            throw new DuplicateResourceException("User already holds this position in this regime");
        }

        // Check if position is already filled in this regime
        boolean positionFilled = assignmentRepository.findByRegimeAndIsCurrentTrueOrderByPositionLevelAsc(regime)
                .stream()
                .anyMatch(a -> a.getPosition().getId().equals(position.getId()));

        if (positionFilled) {
            throw new BusinessRuleViolationException("Position is already filled in this regime");
        }

        LeadershipAssignment assignment = LeadershipAssignment.builder()
                .user(user)
                .position(position)
                .regime(regime)
                .assignedBy(userRepository.findById(adminId)
                        .orElseThrow(() -> new ResourceNotFoundException("Admin user not found")))
                .isCurrent(true)
                .build();

        assignment = assignmentRepository.save(assignment);
        log.info("Admin {} assigned user {} to position {} in regime {}", adminId, user.getEmail(), position.getName(), regime.getName());

        return AssignmentResponse.fromEntity(assignment);
    }

    @Transactional
    public AssignmentResponse updateAssignment(Long id, Long newUserId, Long adminId) {
        LeadershipAssignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        User newUser = userRepository.findById(newUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Archive old assignment
        assignment.setIsCurrent(false);
        assignmentRepository.save(assignment);

        // Create new assignment
        LeadershipAssignment newAssignment = LeadershipAssignment.builder()
                .user(newUser)
                .position(assignment.getPosition())
                .regime(assignment.getRegime())
                .assignedBy(userRepository.findById(adminId)
                        .orElseThrow(() -> new ResourceNotFoundException("Admin user not found")))
                .isCurrent(true)
                .build();

        newAssignment = assignmentRepository.save(newAssignment);
        log.info("Admin {} changed assignment {} from user {} to user {}", adminId, id, assignment.getUser().getEmail(), newUser.getEmail());

        return AssignmentResponse.fromEntity(newAssignment);
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(AssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssignmentResponse> getCurrentAssignments() {
        return assignmentRepository.findCurrentAssignments().stream()
                .map(AssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }
}