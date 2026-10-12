package com.tucasa.mabibo.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tucasa.mabibo.dto.response.ErrorResponse;
import com.tucasa.mabibo.model.entity.User;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Validates the Bearer JWT on every request and, if valid, populates the
 * SecurityContext so downstream @PreAuthorize / hasAuthority checks work.
 *
 * <p>While an account carries {@code mustChangePassword = true} (e.g. after an
 * admin password reset) the session is restricted: only the forced
 * password-change endpoint is reachable, every other API call is rejected with
 * 403 so the restriction cannot be bypassed through direct API calls.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    /** The only endpoints reachable while a password change is forced. */
    private static final Set<String> FORCED_PASSWORD_CHANGE_ALLOWED_PATHS = Set.of(
            "/api/auth/forced-change-password");

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(HEADER);

        if (header == null || !header.startsWith(PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(PREFIX.length());

        UserDetails userDetails;
        try {
            if (!jwtUtil.isValid(token) || jwtUtil.isRefreshToken(token)
                    || SecurityContextHolder.getContext().getAuthentication() != null) {
                filterChain.doFilter(request, response);
                return;
            }

            String email = jwtUtil.extractEmail(token);
            userDetails = userDetailsService.loadUserByUsername(email);
        } catch (Exception ex) {
            // Invalid/expired token: leave context unauthenticated so the
            // request falls through to the standard 401/403 handling.
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        User user = (User) userDetails;

        // Tokens minted while the password change was pending die as soon as the
        // account no longer requires it, so the temporary session cannot be
        // reused after the user has set a permanent password.
        if (jwtUtil.isForcedPasswordChangeToken(token)
                && !Boolean.TRUE.equals(user.getMustChangePassword())) {
            SecurityContextHolder.clearContext();
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized",
                    "Session expired. Please sign in again using your new password.", request.getRequestURI());
            return;
        }

        if (!userDetails.isEnabled()) {
            filterChain.doFilter(request, response);
            return;
        }

        if (Boolean.TRUE.equals(user.getMustChangePassword()) && !isForcedPasswordChangeRequest(request)) {
            writeError(response, HttpServletResponse.SC_FORBIDDEN, "Forbidden",
                    "Password change required", request.getRequestURI());
            return;
        }

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authToken);
        filterChain.doFilter(request, response);
    }

    private boolean isForcedPasswordChangeRequest(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path == null || path.length() < 2) {
            return false;
        }
        if (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        return FORCED_PASSWORD_CHANGE_ALLOWED_PATHS.contains(path);
    }

    private void writeError(HttpServletResponse response, int status, String error, String message, String path)
            throws IOException {
        log.debug("Rejecting request to {} with status {}", path, status);
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        ErrorResponse body = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .build();
        response.getWriter().write(objectMapper.writeValueAsString(body));
        response.getWriter().flush();
    }
}
