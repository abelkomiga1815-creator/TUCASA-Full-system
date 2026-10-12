package com.tucasa.mabibo.service;

import com.tucasa.mabibo.dto.request.AdminResetPasswordRequest;
import com.tucasa.mabibo.dto.request.ChangePasswordRequest;
import com.tucasa.mabibo.dto.request.ForcedChangePasswordRequest;
import com.tucasa.mabibo.dto.request.LoginRequest;
import com.tucasa.mabibo.dto.request.RefreshTokenRequest;
import com.tucasa.mabibo.dto.response.AuthResponse;
import com.tucasa.mabibo.exception.BusinessRuleViolationException;
import com.tucasa.mabibo.exception.InvalidCredentialsException;
import com.tucasa.mabibo.exception.InvalidTokenException;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.model.enums.Role;
import com.tucasa.mabibo.model.enums.UserStatus;
import com.tucasa.mabibo.repository.UserRepository;
import com.tucasa.mabibo.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tests for the temporary-password login and forced password-change flow.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AuthServiceTest {

    private static final String EMAIL = "member@example.com";
    private static final String TEMP_PASSWORD = "TempPass123";

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    private AuthService authService;

    private User user;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, null, passwordEncoder, jwtUtil, null, null);

        user = User.builder()
                .id(7L)
                .firstName("Member")
                .lastName("One")
                .email(EMAIL)
                .role(Role.MEMBER)
                .status(UserStatus.ACTIVE)
                .passwordHash("hashed-temp-password")
                .mustChangePassword(true)
                .build();
    }

    private LoginRequest loginRequest() {
        LoginRequest request = new LoginRequest();
        request.setEmail(EMAIL);
        request.setPassword(TEMP_PASSWORD);
        return request;
    }

    private ForcedChangePasswordRequest forcedRequest(String newPassword, String confirm) {
        ForcedChangePasswordRequest request = new ForcedChangePasswordRequest();
        request.setNewPassword(newPassword);
        request.setConfirmNewPassword(confirm);
        return request;
    }

    @Test
    void loginWithTemporaryPassword_issuesRestrictedSession() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(TEMP_PASSWORD, "hashed-temp-password")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtil.generateAccessToken(eq(7L), eq(EMAIL), anyList(), eq(true))).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(eq(7L), eq(EMAIL), eq(true))).thenReturn("refresh-token");

        AuthResponse response = authService.login(loginRequest());

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        // The flag must reach the frontend so it can redirect to the change page.
        assertThat(response.getUser().getMustChangePassword()).isTrue();
        verify(jwtUtil).generateAccessToken(7L, EMAIL, user.getAuthorities().stream().toList(), true);
        verify(jwtUtil).generateRefreshToken(7L, EMAIL, true);
    }

    @Test
    void loginWithNormalPassword_issuesUnrestrictedSession() {
        user.setMustChangePassword(false);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(TEMP_PASSWORD, "hashed-temp-password")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtil.generateAccessToken(eq(7L), eq(EMAIL), anyList(), eq(false))).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(eq(7L), eq(EMAIL), eq(false))).thenReturn("refresh-token");

        AuthResponse response = authService.login(loginRequest());

        assertThat(response.getUser().getMustChangePassword()).isFalse();
        verify(jwtUtil).generateAccessToken(7L, EMAIL, user.getAuthorities().stream().toList(), false);
    }

    @Test
    void loginWithWrongPassword_isRejected() {
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(TEMP_PASSWORD, "hashed-temp-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(loginRequest()))
                .isInstanceOf(InvalidCredentialsException.class);
        verify(jwtUtil, never()).generateAccessToken(any(), any(), anyList(), org.mockito.ArgumentMatchers.anyBoolean());
    }

    @Test
    void refreshWithTemporaryRefreshToken_isRejectedAfterPasswordChange() {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("old-refresh-token");

        user.setMustChangePassword(false);
        when(jwtUtil.isValid("old-refresh-token")).thenReturn(true);
        when(jwtUtil.isRefreshToken("old-refresh-token")).thenReturn(true);
        when(jwtUtil.extractEmail("old-refresh-token")).thenReturn(EMAIL);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(jwtUtil.isForcedPasswordChangeToken("old-refresh-token")).thenReturn(true);

        assertThatThrownBy(() -> authService.refresh(request))
                .isInstanceOf(InvalidTokenException.class)
                .hasMessageContaining("sign in again");
        verify(jwtUtil, never()).generateAccessToken(any(), any(), anyList(), org.mockito.ArgumentMatchers.anyBoolean());
    }

    @Test
    void refreshWithNormalToken_stillWorks() {
        RefreshTokenRequest request = new RefreshTokenRequest();
        request.setRefreshToken("normal-refresh-token");

        when(jwtUtil.isValid("normal-refresh-token")).thenReturn(true);
        when(jwtUtil.isRefreshToken("normal-refresh-token")).thenReturn(true);
        when(jwtUtil.extractEmail("normal-refresh-token")).thenReturn(EMAIL);
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(user));
        when(jwtUtil.isForcedPasswordChangeToken("normal-refresh-token")).thenReturn(false);
        when(jwtUtil.generateAccessToken(eq(7L), eq(EMAIL), anyList(), eq(true))).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(eq(7L), eq(EMAIL), eq(true))).thenReturn("refresh-token");

        assertThat(authService.refresh(request).getAccessToken()).isEqualTo("access-token");
    }

    @Test
    void forcedChangePassword_savesNewHashAndClearsFlag() {
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode("BrandNewPass1")).thenReturn("hashed-new-password");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        String message = authService.forcedChangePassword(user, forcedRequest("BrandNewPass1", "BrandNewPass1"));

        assertThat(message).contains("Please sign in using your new password");

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertThat(saved.getValue().getPasswordHash()).isEqualTo("hashed-new-password");
        assertThat(saved.getValue().getMustChangePassword()).isFalse();
    }

    @Test
    void forcedChangePassword_rejectsMismatchedConfirmation() {
        assertThatThrownBy(() -> authService.forcedChangePassword(user, forcedRequest("BrandNewPass1", "OtherPass1")))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessage("Passwords do not match");
        verify(userRepository, never()).save(any());
    }

    @Test
    void forcedChangePassword_rejectsReusingTemporaryPassword() {
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("TempPass123", "hashed-temp-password")).thenReturn(true);

        assertThatThrownBy(() -> authService.forcedChangePassword(user, forcedRequest("TempPass123", "TempPass123")))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("must be different");
        verify(userRepository, never()).save(any());
    }

    @Test
    void forcedChangePassword_rejectsAccountThatIsNoLongerForced() {
        user.setMustChangePassword(false);
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.forcedChangePassword(user, forcedRequest("BrandNewPass1", "BrandNewPass1")))
                .isInstanceOf(BusinessRuleViolationException.class)
                .hasMessageContaining("not required");
        verify(userRepository, never()).save(any());
    }

    @Test
    void forcedChangePassword_rejectsUnauthenticatedCaller() {
        assertThatThrownBy(() -> authService.forcedChangePassword(null, forcedRequest("BrandNewPass1", "BrandNewPass1")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Authentication is required");
        verify(userRepository, never()).save(any());
    }

    @Test
    void normalChangePassword_stillVerifiesCurrentPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrong-current");
        request.setNewPassword("BrandNewPass1");
        request.setConfirmNewPassword("BrandNewPass1");

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-current", "hashed-temp-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword(7L, request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Current password is incorrect");
        verify(userRepository, never()).save(any());
    }

    @Test
    void normalChangePassword_succeedsWithCorrectCurrentPassword() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword(TEMP_PASSWORD);
        request.setNewPassword("BrandNewPass1");
        request.setConfirmNewPassword("BrandNewPass1");

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(TEMP_PASSWORD, "hashed-temp-password")).thenReturn(true);
        when(passwordEncoder.encode("BrandNewPass1")).thenReturn("hashed-new-password");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.changePassword(7L, request);

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertThat(saved.getValue().getPasswordHash()).isEqualTo("hashed-new-password");
        assertThat(saved.getValue().getMustChangePassword()).isFalse();
    }

    @Test
    void adminResetPassword_marksAccountForForcedChange() {
        AdminResetPasswordRequest request = new AdminResetPasswordRequest();
        request.setTemporaryPassword(TEMP_PASSWORD);
        request.setConfirmTemporaryPassword(TEMP_PASSWORD);

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(TEMP_PASSWORD)).thenReturn("hashed-temp-password");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.adminResetPassword(7L, request);

        ArgumentCaptor<User> saved = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(saved.capture());
        assertThat(saved.getValue().getMustChangePassword()).isTrue();
        assertThat(saved.getValue().getPasswordHash()).isEqualTo("hashed-temp-password");
    }
}
