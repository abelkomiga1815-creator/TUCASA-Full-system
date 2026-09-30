package com.tucasa.mabibo.service;

import com.tucasa.mabibo.dto.request.LoginRequest;
import com.tucasa.mabibo.dto.request.RefreshTokenRequest;
import com.tucasa.mabibo.dto.request.RegisterRequest;
import com.tucasa.mabibo.dto.request.ResetPasswordRequest;
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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;
    private final PasswordResetService passwordResetService;

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
        userRepository.save(user);

        return issueTokens(user);
    }

    @Transactional(readOnly = true)
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

        return issueTokens(user);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        passwordResetService.verifyAndReset(request);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getAuthorities().stream().toList());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserResponse.fromEntity(user))
                .build();
    }
}