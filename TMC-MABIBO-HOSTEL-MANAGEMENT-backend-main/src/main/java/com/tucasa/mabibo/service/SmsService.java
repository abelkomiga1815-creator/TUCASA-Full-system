package com.tucasa.mabibo.service;

public interface SmsService {

    /**
     * Send an OTP via SMS.
     * @param phoneNumber The destination phone number (e.g., +255712345678)
     * @param otp The 6-digit OTP code
     * @return true if sent successfully, false otherwise
     */
    boolean sendOtp(String phoneNumber, String otp);
}