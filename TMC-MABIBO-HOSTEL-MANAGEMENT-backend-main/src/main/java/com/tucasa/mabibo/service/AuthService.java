package com.tucasa.mabibo.service;

import com.tucasa.mabibo.dto.request.AdminResetPasswordRequest;
import com.tucasa.mabibo.dto.request.ChangePasswordRequest;
import com.tucasa.mabibo.dto.request.ForcedChangePasswordRequest;
import com.tucasa.mabibo.dto.request.LoginRequest;
import com.tucasa.mabibo.dto.request.RefreshTokenRequest;
import com.tucasa.mabibo.dto.request.RegisterRequest;
import com.tucasa.mabibo.dto.response.AuthResponse;
import com.tucasa.mabibo.dto.response.RegisterResponse;
import com.tucasa.mabibo.dto.response.UserResponse;
import com.tucasa.mabibo.exception.BusinessRuleViolationException;
import com.tucasa.mabibo.exception.DuplicateResourceException;
import com.tucasa.mabibo.exception.InvalidCredentialsException;
import com.tucasa.mabibo.exception.InvalidTokenException;
import com.tucasa.mabibo.exception.ResourceNotFoundException;
import com.tucasa.mabibo.model.entity.Branch;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.model.enums.Role;
import com.tucasa.mabibo.model.enums.UserStatus;
import com.tucasa.mabibo.config.CacheConfig;
import com.tucasa.mabibo.repository.BranchRepository;
import com.tucasa.mabibo.repository.UserRepository;
import com.tucasa.mabibo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;

    @Value("${app.branch.default-name}")
    private String defaultBranchName;

    @Transactional
    @CacheEvict(value = CacheConfig.ACTIVE_MEMBERS_COUNT_CACHE, allEntries = true)
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("An account with this email already exists");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("An account with this phone number already exists");
        }

        // Every self-registered user is auto-assigned to the Mabibo Hostel branch.
        Branch branch = branchRepository.findByName(defaultBranchName)
                .orElseThrow(() -> new ResourceNotFoundException("Default branch is not configured"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .middleName(request.getMiddleName())
                .lastName(request.getLastName())
                .email(request.getEmail().toLowerCase())
                .phone(request.getPhone())
                .university(request.getUniversity())
                .program(request.getProgram())
                .yearOfStudy(request.getYearOfStudy())
                .isBaptized(Boolean.TRUE.equals(request.getIsBaptized()))
                .homeRegion(request.getHomeRegion())
                .homeChurch(request.getHomeChurch())
                .talent(request.getTalent())
                .role(Role.MEMBER)
                .status(UserStatus.ACTIVE)
                .branch(branch)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .mustChangePassword(false)
                .build();

        // Handle profile picture upload if provided
        MultipartFile profilePicture = request.getProfilePicture();
        if (profilePicture != null && !profilePicture.isEmpty()) {
            try {
                String profilePicUrl = fileStorageService.storeProfilePicture(profilePicture, user.getId());
                user.setProfilePicUrl(profilePicUrl);
            } catch (IOException e) {
                throw new RuntimeException("Failed to store profile picture", e);
            }
        }

        user = userRepository.save(user);
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        return RegisterResponse.fromEntity(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new InvalidCredentialsException("This account has been suspended");
        }

        user.setLastLogin(LocalDateTime.now());
        user = userRepository.save(user);

        // Credentials are valid, so a session is issued even when the account
        // still has to change its password. The token is flagged and the
        // JwtAuthenticationFilter restricts it to the forced password-change
        // endpoint only.
        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        if (!jwtUtil.isValid(token) || !jwtUtil.isRefreshToken(token)) {
            throw new InvalidTokenException("Refresh token is invalid or expired");
        }

        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidTokenException("User for this token no longer exists"));

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new InvalidTokenException("This account has been suspended");
        }

        // Refresh tokens minted during a forced password change stop working
        // once the password has been changed, forcing a fresh login.
        if (jwtUtil.isForcedPasswordChangeToken(token)
                && !Boolean.TRUE.equals(user.getMustChangePassword())) {
            throw new InvalidTokenException("Session expired. Please sign in again using your new password");
        }

        return issueTokens(user);
    }

    /**
     * Change password for authenticated user.
     * Verifies current password before allowing change.
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BusinessRuleViolationException("Passwords do not match");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }

    /**
     * Admin resets a user's password to a temporary password.
     * Sets mustChangePassword = true so user must change it on next login.
     */
    @Transactional
    public UserResponse adminResetPassword(Long targetUserId, AdminResetPasswordRequest request) {
        if (!request.getTemporaryPassword().equals(request.getConfirmTemporaryPassword())) {
            throw new BusinessRuleViolationException("Passwords do not match");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(request.getTemporaryPassword()));
        user.setMustChangePassword(true);
        userRepository.save(user);

        return UserResponse.fromEntity(user);
    }

    /**
     * Forced password change performed by an authenticated user whose account
     * still carries mustChangePassword = true (e.g. after an admin reset).
     *
     * <p>The temporary password is not requested again: the caller already
     * proved ownership of it while signing in, and the session is restricted to
     * this single endpoint by the JWT filter. The target user is derived from
     * the authenticated principal, so no user id can be supplied from outside.
     *
     * @return a confirmation message, safe to display to the user
     */
    @Transactional
    public String forcedChangePassword(User currentUser, ForcedChangePasswordRequest request) {
        if (currentUser == null || currentUser.getId() == null) {
            throw new InvalidCredentialsException("Authentication is required to change the password");
        }
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BusinessRuleViolationException("Passwords do not match");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!Boolean.TRUE.equals(user.getMustChangePassword())) {
            throw new BusinessRuleViolationException("This account is not required to change its password");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BusinessRuleViolationException(
                    "The new password must be different from the temporary password you just used");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        return "Password changed successfully. Please sign in using your new password.";
    }

    @Transactional
    public UserResponse updateProfilePicture(Long userId, MultipartFile profilePicture) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String previousPicUrl = user.getProfilePicUrl();

        // Store the new picture FIRST and only remove the previous one once the
        // upload has genuinely succeeded. Deleting up-front would destroy the
        // user's existing photo whenever validation or storage fails, leaving
        // the account pointing at a file that no longer exists.
        String profilePicUrl;
        try {
            profilePicUrl = fileStorageService.storeProfilePicture(profilePicture, userId);
        } catch (IOException e) {
            // Nothing has been written to the user row or removed from disk yet,
            // so the existing photo is left untouched.
            throw new RuntimeException("Failed to store profile picture", e);
        }

        user.setProfilePicUrl(profilePicUrl);
        userRepository.save(user);

        if (previousPicUrl != null && !previousPicUrl.equals(profilePicUrl)) {
            deleteStoredPicture(previousPicUrl);
        }

        return UserResponse.fromEntity(user);
    }

    /**
     * Removes a stored profile picture, tolerating absence so a stale or
     * already-deleted file never turns an otherwise successful update into an
     * error (which would look like the upload failed).
     */
    private void deleteStoredPicture(String picUrl) {
        try {
            String filename = picUrl.substring(picUrl.lastIndexOf('/') + 1);
            fileStorageService.deleteProfilePicture(filename);
        } catch (IOException ex) {
            log.warn("Could not remove previous profile picture {}", picUrl, ex);
        }
    }

    private AuthResponse issueTokens(User user) {
        boolean forcedPasswordChange = Boolean.TRUE.equals(user.getMustChangePassword());

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(),
                user.getAuthorities().stream().toList(), forcedPasswordChange);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), forcedPasswordChange);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserResponse.fromEntity(user))
                .build();
    }
}