package com.tucasa.mabibo.security;

import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.model.enums.Role;
import com.tucasa.mabibo.model.enums.UserStatus;
import com.tucasa.mabibo.security.CustomUserDetailsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.json.JsonMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Verifies that a session opened with a temporary password can only reach the
 * forced password-change endpoint, and that such a session dies as soon as the
 * password has been changed.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class JwtAuthenticationFilterTest {

    private static final String EMAIL = "member@example.com";
    private static final String SECRET =
            "ZmFrZS1kZXYtb25seS1zZWNyZXQtcmVwbGFjZS1pbi1wcm9kLTEyMzQ1Njc4OTBhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5eg==";

    @Mock
    private CustomUserDetailsService userDetailsService;

    private JwtUtil jwtUtil;

    private JwtAuthenticationFilter filter;

    private User user;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, 3_600_000L, 1_209_600_000L, "tucasa-mabibo-backend");
        ObjectMapper objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        filter = new JwtAuthenticationFilter(jwtUtil, userDetailsService, objectMapper);
        SecurityContextHolder.clearContext();

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

        when(userDetailsService.loadUserByUsername(EMAIL)).thenReturn(user);
    }

    private MockHttpServletRequest request(String uri) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", uri);
        request.setServletPath(uri);
        return request;
    }

    @Test
    void temporarySessionCanReachTheForcedChangeEndpoint() throws Exception {
        String token = jwtUtil.generateAccessToken(7L, EMAIL, user.getAuthorities().stream().toList(), true);
        MockHttpServletRequest request = request("/api/auth/forced-change-password");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
    }

    @Test
    void temporarySessionCannotReachOtherApis() throws Exception {
        String token = jwtUtil.generateAccessToken(7L, EMAIL, user.getAuthorities().stream().toList(), true);
        String[] blocked = {
                "/api/members/me",
                "/api/admin/users",
                "/api/chat/messages",
                "/api/announcements"
        };

        for (String uri : blocked) {
            SecurityContextHolder.clearContext();
            MockHttpServletRequest request = request(uri);
            request.addHeader("Authorization", "Bearer " + token);
            MockHttpServletResponse response = new MockHttpServletResponse();

            filter.doFilter(request, response, new MockFilterChain());

            assertThat(response.getStatus()).as(uri).isEqualTo(403);
            assertThat(response.getContentAsString()).as(uri).contains("Password change required");
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }
    }

    @Test
    void temporarySessionIsRejectedOnceThePasswordHasBeenChanged() throws Exception {
        String token = jwtUtil.generateAccessToken(7L, EMAIL, user.getAuthorities().stream().toList(), true);
        user.setMustChangePassword(false); // password was changed meanwhile

        MockHttpServletRequest request = request("/api/auth/forced-change-password");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(response.getContentAsString()).contains("sign in again");
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    @Test
    void normalSessionIsUnaffected() throws Exception {
        user.setMustChangePassword(false);
        String token = jwtUtil.generateAccessToken(7L, EMAIL, user.getAuthorities().stream().toList(), false);

        MockHttpServletRequest request = request("/api/members/me");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo(EMAIL);
    }

    @Test
    void refreshTokensAreNeverAcceptedAsBearerTokens() throws Exception {
        String token = jwtUtil.generateRefreshToken(7L, EMAIL, true);
        MockHttpServletRequest request = request("/api/members/me");
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(userDetailsService, org.mockito.Mockito.never()).loadUserByUsername(EMAIL);
    }
}
