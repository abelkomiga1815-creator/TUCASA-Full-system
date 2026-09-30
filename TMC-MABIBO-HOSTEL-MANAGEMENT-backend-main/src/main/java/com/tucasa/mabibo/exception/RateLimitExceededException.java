package com.tucasa.mabibo.exception;

/**
 * Thrown when a client exceeds the allowed number of password reset
 * requests within the rate limit window. Mapped to HTTP 429.
 */
public class RateLimitExceededException extends RuntimeException {
    public RateLimitExceededException(String message) {
        super(message);
    }
}
