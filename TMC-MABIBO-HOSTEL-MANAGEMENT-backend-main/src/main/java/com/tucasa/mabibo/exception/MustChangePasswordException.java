package com.tucasa.mabibo.exception;

/**
 * Thrown when user must change their password before accessing the application.
 * Typically thrown after admin password reset or when mustChangePassword flag is true.
 */
public class MustChangePasswordException extends RuntimeException {

    private final Long userId;

    public MustChangePasswordException(Long userId) {
        super("Password change required");
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }
}