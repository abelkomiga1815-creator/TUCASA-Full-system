package com.tucasa.mabibo.service;

import com.tucasa.mabibo.dto.request.ForgotPasswordRequest;
import com.tucasa.mabibo.dto.request.ResetPasswordRequest;
import com.tucasa.mabibo.exception.BusinessRuleViolationException;
import com.tucasa.mabibo.exception.RateLimitExceededException;
import com.tucasa.mabibo.exception.ResourceNotFoundException;
import com.tucasa.mabibo.model.entity.PasswordResetToken;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.repository.PasswordResetTokenRepository;
import com.tucasa.mabibo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final SmsService smsService;
    private final OtpRateLimiter rateLimiter;

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;

    @Value("${app.otp.max-attempts:5}")
    private int maxOtpAttempts;

    private final SecureRandom secureRandom = new SecureRandom();

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                PasswordEncoder passwordEncoder,
                                EmailService emailService,
                                SmsService smsService,
                                OtpRateLimiter rateLimiter) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.smsService = smsService;
        this.rateLimiter = rateLimiter;
    }

    /**
     * Request a password reset OTP via email or SMS.
     * Always returns a generic success message to prevent user enumeration.
     */
    @Transactional
    public void requestReset(ForgotPasswordRequest request) {
        String identifier = request.getIdentifier().trim().toLowerCase();
        String channel = request.getChannel().name();

        // Rate limiting: applies uniformly to every identifier (existing user
        // or not) so throttling cannot be used to enumerate accounts.
        if (!rateLimiter.allow(identifier)) {
            throw new RateLimitExceededException(
                    "Too many password reset requests. Please try again later.");
        }

        // Find user by email or phone
        Optional<User> userOpt = findUserByIdentifier(request.getIdentifier());
        if (userOpt.isEmpty()) {
            // Don't reveal whether user exists - always return success
            return;
        }

        User user = userOpt.get();

        // Verify the channel matches the identifier type
        if ("EMAIL".equals(channel) && !request.getIdentifier().contains("@")) {
            throw new BusinessRuleViolationException("Invalid email format");
        }
        if ("SMS".equals(channel) && !request.getIdentifier().matches("^\\+?[0-9]{9,15}$")) {
            throw new BusinessRuleViolationException("Invalid phone number format");
        }

        // Invalidate all existing unconsumed tokens for this user
        tokenRepository.markAllConsumedForUser(user, LocalDateTime.now());

        // Generate 6-digit OTP
        String otp = generateOtp();
        String otpHash = passwordEncoder.encode(otp);

        // Create token
        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .channel(channel)
                .destination(request.getIdentifier().trim().toLowerCase())
                .otpHash(otpHash)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpiryMinutes))
                .attempts(0)
                .build();

        tokenRepository.save(token);

        // Send OTP via selected channel
        if ("EMAIL".equals(channel)) {
            emailService.sendPasswordResetOtp(request.getIdentifier().trim(), otp);
        } else {
            smsService.sendOtp(request.getIdentifier().trim(), otp);
        }
    }

    /**
     * Verify OTP and reset password.
     */
    @Transactional
    public void verifyAndReset(ResetPasswordRequest request) {
        if (!request.passwordsMatch()) {
            throw new BusinessRuleViolationException("Passwords do not match");
        }

        String identifier = request.getIdentifier().trim().toLowerCase();
        String channel = request.getChannel().name();

        // Find valid tokens for this destination
        List<PasswordResetToken> tokens = tokenRepository.findValidTokensForVerification(
                request.getIdentifier().trim().toLowerCase(),
                channel,
                LocalDateTime.now());

        PasswordResetToken validToken = null;
        for (PasswordResetToken token : tokens) {
            if (passwordEncoder.matches(request.getOtp(), token.getOtpHash())) {
                validToken = token;
                break;
            }
        }

        if (validToken == null) {
            // Increment attempts on the most recent token
            tokenRepository.findValidTokensForVerification(
                    request.getIdentifier().trim().toLowerCase(),
                    channel,
                    LocalDateTime.now()
            ).stream().findFirst().ifPresent(token ->
                    tokenRepository.incrementAttempts(token.getId())
            );
            throw new BusinessRuleViolationException("Invalid or expired OTP");
        }

        // Check attempts
        if (validToken.getAttempts() >= maxOtpAttempts) {
            throw new BusinessRuleViolationException("Maximum OTP attempts exceeded. Please request a new code.");
        }

        // Verify OTP matches (already checked above)
        // Mark token as consumed
        tokenRepository.markConsumed(validToken.getId(), LocalDateTime.now());

        // Find user and update password
        User user = userRepository.findById(validToken.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());

        // Invalidate all other tokens for this user
        tokenRepository.markAllConsumedForUser(validToken.getUser(), LocalDateTime.now());

        log.info("Password reset successful for user: {}", user.getEmail());
    }

    /**
     * Clean up expired tokens (can be called by a scheduler).
     */
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpired(LocalDateTime.now());
    }

    // Helper methods

    private Optional<User> findUserByIdentifier(String identifier) {
        String trimmed = identifier.trim().toLowerCase();
        if (trimmed.contains("@")) {
            return userRepository.findByEmail(trimmed);
        } else {
            return userRepository.findByPhone(trimmed);
        }
    }

    private User findUserByIdentifierOrThrow(String identifier) {
        return findUserByIdentifier(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private String generateOtp() {
        int otp = 100000 + secureRandom.nextInt(900000); // 6 digits: 100000-999999
        return String.valueOf(otp);
    }
}