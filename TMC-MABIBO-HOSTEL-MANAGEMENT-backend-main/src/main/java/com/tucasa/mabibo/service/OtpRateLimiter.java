package com.tucasa.mabibo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * In-memory fixed-window rate limiter for password reset requests.
 *
 * Keyed purely on the submitted identifier (email/phone), independent of
 * whether a user exists for it, so throttling behaviour is identical for
 * known and unknown identifiers and cannot be used to enumerate accounts.
 */
@Component
public class OtpRateLimiter {

    private final ConcurrentHashMap<String, Deque<LocalDateTime>> attempts = new ConcurrentHashMap<>();
    private final int maxRequests;
    private final long windowMinutes;

    public OtpRateLimiter(
            @Value("${app.otp.rate-limit-requests:3}") int maxRequests,
            @Value("${app.otp.rate-limit-window-minutes:15}") long windowMinutes) {
        this.maxRequests = maxRequests;
        this.windowMinutes = windowMinutes;
    }

    /**
     * Records an attempt for the given key and returns true if the request
     * is allowed, false if the key has exceeded the limit within the window.
     */
    public boolean allow(String key) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime cutoff = now.minusMinutes(windowMinutes);

        Deque<LocalDateTime> deque = attempts.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst().isBefore(cutoff)) {
                deque.pollFirst();
            }
            if (deque.size() >= maxRequests) {
                return false;
            }
            deque.addLast(now);
            return true;
        }
    }
}
