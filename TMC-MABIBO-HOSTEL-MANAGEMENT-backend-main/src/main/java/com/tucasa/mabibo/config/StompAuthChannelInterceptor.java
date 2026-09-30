package com.tucasa.mabibo.config;

import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import com.tucasa.mabibo.security.CustomUserDetailsService;
import com.tucasa.mabibo.security.JwtUtil;

import lombok.RequiredArgsConstructor;

/**
 * Validates the JWT sent as a STOMP "Authorization" header on CONNECT and
 * attaches the resulting Authentication to the STOMP session, so
 * @MessageMapping handlers (e.g. ChatController) can resolve Principal.
 *
 * Frontend usage: client sets the STOMP CONNECT header
 *   Authorization: Bearer <accessToken>
 * before calling stompClient.connect(...).
 */
@Component
@RequiredArgsConstructor
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private static final String HEADER = "Authorization";
    private static final String PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String header = accessor.getFirstNativeHeader(HEADER);

            if (header != null && header.startsWith(PREFIX)) {
                String token = header.substring(PREFIX.length());

                if (jwtUtil.isValid(token) && !jwtUtil.isRefreshToken(token)) {
                    String email = jwtUtil.extractEmail(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    if (userDetails.isEnabled()) {
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        accessor.setUser(authToken);
                    } else {
                        throw new BadCredentialsException("Account is suspended");
                    }
                } else {
                    throw new BadCredentialsException("Invalid access token");
                }
            } else {
                throw new BadCredentialsException("Authorization is required");
            }
        }

        return message;
    }
}
