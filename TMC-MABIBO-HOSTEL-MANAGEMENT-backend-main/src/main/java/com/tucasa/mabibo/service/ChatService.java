package com.tucasa.mabibo.service;

import com.tucasa.mabibo.dto.response.ChatHistoryMessage;
import com.tucasa.mabibo.exception.ResourceNotFoundException;
import com.tucasa.mabibo.model.entity.ChatMessage;
import com.tucasa.mabibo.model.entity.User;
import com.tucasa.mabibo.repository.ChatMessageRepository;
import com.tucasa.mabibo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessage persistMessage(Long senderId, String roomId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ChatMessage message = ChatMessage.builder()
                .sender(sender)
                .roomId(roomId == null || roomId.isBlank() ? "public" : roomId)
                .message(content)
                .isRead(false)
                .build();

        return chatMessageRepository.save(message);
    }

    /**
     * Last N messages of a room in chronological order (oldest first),
     * so a client can render history directly above live messages.
     */
    @Transactional(readOnly = true)
    public List<ChatHistoryMessage> getRecentMessages(String roomId, int limit) {
        String room = roomId == null || roomId.isBlank() ? "public" : roomId.trim();
        int size = Math.min(Math.max(limit, 1), 200);
        List<ChatMessage> newestFirst =
                chatMessageRepository.findByRoomIdOrderBySentAtDesc(room, PageRequest.of(0, size));
        List<ChatMessage> chronological = new ArrayList<>(newestFirst);
        Collections.reverse(chronological);
        return chronological.stream().map(ChatHistoryMessage::fromEntity).toList();
    }
}
