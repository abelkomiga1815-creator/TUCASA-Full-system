package com.tucasa.mabibo.repository;

import com.tucasa.mabibo.model.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findTop50ByRoomIdOrderBySentAtDesc(String roomId);

    List<ChatMessage> findByRoomIdOrderBySentAtDesc(String roomId, Pageable pageable);
}
