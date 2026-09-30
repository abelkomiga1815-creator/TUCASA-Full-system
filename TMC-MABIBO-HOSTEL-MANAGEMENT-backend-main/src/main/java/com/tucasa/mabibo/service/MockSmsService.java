package com.tucasa.mabibo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("!prod") // Only active in non-production profiles
public class MockSmsService implements SmsService {

    @Value("${app.sms.mock-enabled:true}")
    private boolean mockEnabled;

    @Override
    public boolean sendOtp(String phoneNumber, String otp) {
        if (!mockEnabled) {
            return false;
        }
        // In development/test, just log the OTP to console
        System.out.println("==================================================");
        System.out.println("=== MOCK SMS OTP DELIVERY ===");
        System.out.println("To: " + phoneNumber);
        System.out.println("OTP: " + otp);
        System.out.println("Expires in: 10 minutes");
        System.out.println("==================================================");
        return true;
    }
}