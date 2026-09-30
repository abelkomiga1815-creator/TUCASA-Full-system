package com.tucasa.mabibo.dto.response;

import com.tucasa.mabibo.model.entity.ChatMessage;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatHistoryMessage {

    private Long id;
    private Long senderId;
    private String senderName;
    private String senderProfilePicUrl;
    private String roomId;
    private String message;
    private LocalDateTime sentAt;

    public static ChatHistoryMessage fromEntity(ChatMessage m) {
        return ChatHistoryMessage.builder()
                .id(m.getId())
                .senderId(m.getSender() != null ? m.getSender().getId() : null)
                .senderName(m.getSender() != null ? m.getSender().getFullName() : "Unknown")
                .senderProfilePicUrl(m.getSender() != null ? m.getSender().getProfilePicUrl() : null)
                .roomId(m.getRoomId())
                .message(m.getMessage())
                .sentAt(m.getSentAt())
                .build();
    }
}
