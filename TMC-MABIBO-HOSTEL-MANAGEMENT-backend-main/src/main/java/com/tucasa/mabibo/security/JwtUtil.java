package com.tucasa.mabibo.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    /**
     * Claim used to mark tokens that were issued while the account was still
     * required to change its password (e.g. right after an admin reset).
     * Such tokens may only be used to complete the forced password change and
     * are rejected by {@link JwtAuthenticationFilter} as soon as the account no
     * longer carries the mustChangePassword flag.
     */
    public static final String FORCED_PASSWORD_CHANGE_CLAIM = "pwc";

    private final SecretKey signingKey;
    private final long accessTokenExpirationMs;
    private final long refreshTokenExpirationMs;
    private final String issuer;

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-expiration-ms}") long accessTokenExpirationMs,
            @Value("${app.jwt.refresh-token-expiration-ms}") long refreshTokenExpirationMs,
            @Value("${app.jwt.issuer}") String issuer) {
        this.signingKey = Keys.hmacShaKeyFor(Base64.getDecoder().decode(secret));
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
        this.issuer = issuer;
    }

    public String generateAccessToken(Long userId, String email, List<? extends GrantedAuthority> authorities) {
        return generateAccessToken(userId, email, authorities, false);
    }

    public String generateAccessToken(Long userId, String email, List<? extends GrantedAuthority> authorities,
                                      boolean forcedPasswordChange) {
        String scopes = authorities.stream().map(GrantedAuthority::getAuthority).collect(Collectors.joining(","));
        Date now = new Date();
        Date expiry = new Date(now.getTime() + accessTokenExpirationMs);
        JwtBuilder builder = Jwts.builder()
                .issuer(issuer)
                .subject(email)
                .claim("uid", userId)
                .claim("scope", scopes)
                .claim("type", "access")
                .issuedAt(now)
                .expiration(expiry);
        if (forcedPasswordChange) {
            builder.claim(FORCED_PASSWORD_CHANGE_CLAIM, true);
        }
        return builder.signWith(signingKey).compact();
    }

    public String generateRefreshToken(Long userId, String email) {
        return generateRefreshToken(userId, email, false);
    }

    public String generateRefreshToken(Long userId, String email, boolean forcedPasswordChange) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + refreshTokenExpirationMs);
        JwtBuilder builder = Jwts.builder()
                .issuer(issuer)
                .subject(email)
                .claim("uid", userId)
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(expiry);
        if (forcedPasswordChange) {
            builder.claim(FORCED_PASSWORD_CHANGE_CLAIM, true);
        }
        return builder.signWith(signingKey).compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (ExpiredJwtException | UnsupportedJwtException | MalformedJwtException
                 | SignatureException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(parseClaims(token).get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public Long extractUserId(String token) {
        return parseClaims(token).get("uid", Long.class);
    }

    /**
     * True when the token was minted while the account was still required to
     * change its password. Invalid (expired/malformed) tokens return false.
     */
    public boolean isForcedPasswordChangeToken(String token) {
        try {
            return Boolean.TRUE.equals(parseClaims(token).get(FORCED_PASSWORD_CHANGE_CLAIM, Boolean.class));
        } catch (Exception e) {
            return false;
        }
    }
}
