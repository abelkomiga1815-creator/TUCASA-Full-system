package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.PasswordResetToken;
import com.tucasa.mabibo.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Find the latest valid (not consumed, not expired) token for a user and channel.
     */
    @Query("""
            SELECT t FROM PasswordResetToken t
            WHERE t.user = :user
              AND t.channel = :channel
              AND t.consumedAt IS NULL
              AND t.expiresAt > :now
            ORDER BY t.createdAt DESC
            """)
    Optional<PasswordResetToken> findLatestValidToken(@Param("user") User user, @Param("channel") String channel, @Param("now") LocalDateTime now);

    /**
     * Find a valid token by destination (email/phone) and channel.
     */
    @Query("""
            SELECT t FROM PasswordResetToken t
            WHERE t.destination = :destination
              AND t.channel = :channel
              AND t.consumedAt IS NULL
              AND t.expiresAt > :now
            ORDER BY t.createdAt DESC
            """)
    Optional<PasswordResetToken> findLatestValidTokenByDestination(
            @Param("destination") String destination,
            @Param("channel") String channel,
            @Param("now") LocalDateTime now);

    /**
     * Count recent reset requests for rate limiting.
     */
@Query("""
            SELECT COUNT(t) FROM PasswordResetToken t
            WHERE t.destination = :destination
              AND t.createdAt > :since
            """)
long countRecentRequests(@Param("destination") String destination, @Param("since") LocalDateTime since);

/**
 * Find token by destination and OTP (for verification) - we'll check hash in service.
 * Actually we need to find all recent unconsumed tokens for the destination and verify hash in service.
 */
@Query("""
            SELECT t FROM PasswordResetToken t
            WHERE t.destination = :destination
              AND t.channel = :channel
              AND t.consumedAt IS NULL
              AND t.expiresAt > :now
            ORDER BY t.createdAt DESC
            """)
    List<PasswordResetToken> findValidTokensForVerification(
            @Param("destination") String destination,
            @Param("channel") String channel,
            @Param("now") LocalDateTime now);

    /**
     * Increment attempt count for a token.
     */
    @Modifying
    @Query("""
            UPDATE PasswordResetToken t
            SET t.attempts = t.attempts + 1
            WHERE t.id = :id
            """)
    void incrementAttempts(@Param("id") Long id);

    /**
     * Mark token as consumed.
     */
    @Modifying
    @Query("""
            UPDATE PasswordResetToken t
            SET t.consumedAt = :now
            WHERE t.id = :id
            """)
    void markConsumed(@Param("id") Long id, @Param("now") LocalDateTime now);

    /**
     * Mark all outstanding tokens for a user as consumed.
     */
    @Modifying
    @Query("""
            UPDATE PasswordResetToken t
            SET t.consumedAt = :now
            WHERE t.user = :user
              AND t.consumedAt IS NULL
            """)
    void markAllConsumedForUser(@Param("user") User user, @Param("now") LocalDateTime now);

    /**
     * Delete expired tokens (cleanup).
     */
    @Modifying
    @Query("""
            DELETE FROM PasswordResetToken t
            WHERE t.expiresAt < :now
            """)
    void deleteExpired(@Param("now") LocalDateTime now);
}