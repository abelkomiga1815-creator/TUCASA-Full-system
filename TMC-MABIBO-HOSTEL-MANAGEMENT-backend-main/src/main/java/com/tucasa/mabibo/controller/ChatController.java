package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.request.ChatMessageRequest;
import com.tucasa.mabibo.model.entity.ChatMessage;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

/**
 * STOMP handler for the public chat room.
 *
 * Client sends to: /app/chat.sendMessage
 * Server broadcasts to: /topic/public
 *
 * The STOMP session's Principal is populated by the same JWT handshake
 * interceptor chain used for REST (Spring resolves it from the
 * SecurityContext established during the WebSocket handshake).
 */
@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatBroadcastMessage sendMessage(ChatMessageRequest request, Principal principal) {
        Long senderId = null;
        String senderName = "Unknown";
        String senderProfilePicUrl = null;

        if (principal instanceof Authentication auth && auth.getPrincipal() instanceof User user) {
            senderId = user.getId();
            senderName = user.getFullName();
            senderProfilePicUrl = user.getProfilePicUrl();
        }

        ChatMessage saved = chatService.persistMessage(senderId, request.getRoomId(), request.getMessage());

        return ChatBroadcastMessage.builder()
                .id(saved.getId())
                .senderId(senderId)
                .senderName(senderName)
                .senderProfilePicUrl(senderProfilePicUrl)
                .roomId(saved.getRoomId())
                .message(saved.getMessage())
                .sentAt(saved.getSentAt())
                .build();
    }

    /**
     * Lightweight broadcast payload - deliberately separate from the
     * ChatMessage entity so we never leak JPA proxies or lazy
     * associations onto the STOMP topic.
     */
    @lombok.Data
    @lombok.Builder
    public static class ChatBroadcastMessage {
        private Long id;
        private Long senderId;
        private String senderName;
        private String senderProfilePicUrl;
        private String roomId;
        private String message;
        private LocalDateTime sentAt;
    }
}
