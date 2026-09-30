package com.tucasa.mabibo.exception;

/**
 * Thrown when a request would violate a core TUCASA business rule, e.g.:
 * attempting to un-baptize a member, updating a semester record for an
 * alumnus, or promoting/demoting incorrectly.
 */
public class BusinessRuleViolationException extends RuntimeException {
    public BusinessRuleViolationException(String message) {
        super(message);
    }
}
