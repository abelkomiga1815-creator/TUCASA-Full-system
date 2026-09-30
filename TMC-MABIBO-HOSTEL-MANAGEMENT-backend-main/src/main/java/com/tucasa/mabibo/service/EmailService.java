package com.tucasa.mabibo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Mock async email service. In a real deployment this would use
 * JavaMailSender; here it just logs, so the rest of the system can be
 * developed/tested without a real SMTP server. Toggle app.mail.enabled
 * to swap in a real implementation later without touching call sites.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Async("emailTaskExecutor")
    public void sendWelcomeEmail(String toEmail, String fullName) {
        send(toEmail, "Welcome to TUCASA UDSM MABIBO HOSTEL", "Hi " + fullName + ", welcome to TUCASA!");
    }

    @Async("emailTaskExecutor")
    public void sendBaptismConfirmationEmail(String toEmail, String fullName) {
        send(toEmail, "Baptism Recorded", "Praise God, " + fullName + "! Your baptism has been recorded.");
    }

    @Async("emailTaskExecutor")
    public void sendGraduationEmail(String toEmail, String fullName) {
        send(toEmail, "Congratulations, Graduate!", "Congratulations " + fullName + " - you're now a TUCASA alumnus.");
    }

    @Async("emailTaskExecutor")
    public void sendPasswordResetOtp(String toEmail, String otp) {
        String subject = "Your TUCASA Password Reset Code";
        String body = "Your password reset code is: " + otp + "\n\n" +
                "This code will expire in 10 minutes.\n\n" +
                "If you didn't request this, please ignore this email.";
        send(toEmail, subject, body);
    }

    private void send(String toEmail, String subject, String body) {
        if (!mailEnabled) {
            log.info("[MOCK EMAIL] to={} subject='{}' body='{}'", toEmail, subject, body);
            return;
        }
        // Real send would go here via JavaMailSender.
        log.info("Sending email to={} subject='{}'", toEmail, subject);
    }
}
