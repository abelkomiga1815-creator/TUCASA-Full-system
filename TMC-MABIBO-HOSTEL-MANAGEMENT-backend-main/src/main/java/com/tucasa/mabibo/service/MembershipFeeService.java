package com.tucasa.mabibo.service;

import com.tucasa.mabibo.dto.request.FeeBulkRequest;
import com.tucasa.mabibo.dto.request.FeeCreateRequest;
import com.tucasa.mabibo.dto.response.MembershipFeeResponse;
import com.tucasa.mabibo.exception.BusinessRuleViolationException;
import com.tucasa.mabibo.exception.ResourceNotFoundException;
import com.tucasa.mabibo.model.entity.MembershipFee;
import com.tucasa.mabibo.model.entity.Semester;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.repository.MembershipFeeRepository;
import com.tucasa.mabibo.repository.SemesterRepository;
import com.tucasa.mabibo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipFeeService {

    private static final Set<String> ALLOWED_PAYMENT_METHODS = Set.of(
            "CASH", "MPESA", "TIGO_PESA", "AIRTEL_MONEY", "BANK");

    private final MembershipFeeRepository feeRepository;
    private final UserRepository userRepository;
    private final SemesterRepository semesterRepository;

    @Transactional(readOnly = true)
    public Page<MembershipFeeResponse> listFees(String status, Long semesterId, Pageable pageable) {
        String normalizedStatus = normalizeStatus(status);
        Page<MembershipFee> page;
        if (semesterId != null) {
            Semester semester = findSemester(semesterId);
            page = normalizedStatus != null
                    ? feeRepository.findBySemesterAndStatusOrderByCreatedAtDesc(semester, normalizedStatus, pageable)
                    : feeRepository.findBySemesterOrderByCreatedAtDesc(semester, pageable);
        } else if (normalizedStatus != null) {
            page = feeRepository.findByStatusOrderByCreatedAtDesc(normalizedStatus, pageable);
        } else {
            page = feeRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return page.map(MembershipFeeResponse::fromEntity);
    }

    @Transactional
    public MembershipFeeResponse createFee(FeeCreateRequest request, Long adminId) {
        User user = findUser(request.getUserId());
        Semester semester = request.getSemesterId() != null
                ? findSemester(request.getSemesterId())
                : semesterRepository.findByIsActiveTrue().orElse(null);

        MembershipFee fee = MembershipFee.builder()
                .user(user)
                .semester(semester)
                .amount(request.getAmount())
                .currency(request.getCurrency() != null && !request.getCurrency().isBlank()
                        ? request.getCurrency().trim().toUpperCase() : "TZS")
                .status(MembershipFee.STATUS_PENDING)
                .paymentMethod(normalizePaymentMethod(request.getPaymentMethod()))
                .referenceNumber(request.getReferenceNumber())
                .notes(request.getNotes())
                .build();

        fee = feeRepository.save(fee);
        log.info("Admin {} created PENDING fee {} (amount {} {}) for user {}",
                adminId, fee.getId(), fee.getAmount(), fee.getCurrency(), user.getEmail());
        return MembershipFeeResponse.fromEntity(fee);
    }

    @Transactional
    public MembershipFeeResponse confirmFee(Long feeId, Long adminId) {
        MembershipFee fee = findFee(feeId);
        if (!MembershipFee.STATUS_PENDING.equals(fee.getStatus())) {
            throw new BusinessRuleViolationException("Only PENDING fees can be confirmed");
        }
        User admin = findUser(adminId);

        fee.setStatus(MembershipFee.STATUS_PAID);
        if (fee.getPaidAt() == null) {
            fee.setPaidAt(LocalDateTime.now());
        }
        fee.setConfirmedBy(admin);
        fee.setConfirmedAt(LocalDateTime.now());
        fee = feeRepository.save(fee);

        log.info("Admin {} confirmed payment for fee {} (user {}, amount {} {})",
                adminId, fee.getId(), fee.getUser().getEmail(), fee.getAmount(), fee.getCurrency());
        return MembershipFeeResponse.fromEntity(fee);
    }

    @Transactional
    public MembershipFeeResponse waiveFee(Long feeId, Long adminId) {
        MembershipFee fee = findFee(feeId);
        if (!MembershipFee.STATUS_PENDING.equals(fee.getStatus())) {
            throw new BusinessRuleViolationException("Only PENDING fees can be waived");
        }
        User admin = findUser(adminId);

        fee.setStatus(MembershipFee.STATUS_WAIVED);
        fee.setConfirmedBy(admin);
        fee.setConfirmedAt(LocalDateTime.now());
        fee = feeRepository.save(fee);

        log.info("Admin {} waived fee {} (user {}, amount {} {})",
                adminId, fee.getId(), fee.getUser().getEmail(), fee.getAmount(), fee.getCurrency());
        return MembershipFeeResponse.fromEntity(fee);
    }

    @Transactional
    public int bulkCreate(FeeBulkRequest request, Short adminBranchId, Long adminId) {
        Semester semester = findSemester(request.getSemesterId());
        List<User> candidates = feeRepository.findActiveUsersWithoutFeeForSemester(adminBranchId, semester);

        String currency = request.getCurrency() != null && !request.getCurrency().isBlank()
                ? request.getCurrency().trim().toUpperCase() : "TZS";
        for (User user : candidates) {
            MembershipFee fee = MembershipFee.builder()
                    .user(user)
                    .semester(semester)
                    .amount(request.getAmount())
                    .currency(currency)
                    .status(MembershipFee.STATUS_PENDING)
                    .notes(request.getNotes())
                    .build();
            feeRepository.save(fee);
        }

        log.info("Admin {} bulk-created {} PENDING fees for semester {} (amount {} {})",
                adminId, candidates.size(), semester.getName(), request.getAmount(), currency);
        return candidates.size();
    }

    @Transactional(readOnly = true)
    public List<MembershipFeeResponse> myFees(Long userId) {
        User user = findUser(userId);
        return feeRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(MembershipFeeResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public long countPaidForSemester(Semester semester) {
        return feeRepository.countActiveMembersForSemester(semester);
    }

    @Transactional(readOnly = true)
    public long countPendingForSemester(Semester semester) {
        return feeRepository.countBySemesterAndStatus(semester, MembershipFee.STATUS_PENDING);
    }

    @Transactional(readOnly = true)
    public long countAllPending() {
        return feeRepository.countByStatus(MembershipFee.STATUS_PENDING);
    }

    private MembershipFee findFee(Long feeId) {
        return feeRepository.findById(feeId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found"));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Semester findSemester(Long semesterId) {
        return semesterRepository.findById(semesterId)
                .orElseThrow(() -> new ResourceNotFoundException("Semester not found"));
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        String upper = status.trim().toUpperCase();
        if (!MembershipFee.STATUS_PENDING.equals(upper)
                && !MembershipFee.STATUS_PAID.equals(upper)
                && !MembershipFee.STATUS_WAIVED.equals(upper)) {
            throw new BusinessRuleViolationException("Invalid fee status filter");
        }
        return upper;
    }

    private String normalizePaymentMethod(String method) {
        if (method == null || method.isBlank()) {
            return null;
        }
        String upper = method.trim().toUpperCase();
        if (!ALLOWED_PAYMENT_METHODS.contains(upper)) {
            throw new BusinessRuleViolationException("Unsupported payment method");
        }
        return upper;
    }
}
