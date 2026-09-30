package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.response.ChatHistoryMessage;
import com.tucasa.mabibo.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "Chat History", description = "Read recent messages of the global chat room")
public class ChatHistoryController {

    private final ChatService chatService;

    @GetMapping("/messages")
    @Operation(summary = "Last N messages of a room in chronological order (defaults: room=public, limit=100)")
    public ResponseEntity<List<ChatHistoryMessage>> getMessages(
            @RequestParam(required = false, defaultValue = "public") String room,
            @RequestParam(required = false, defaultValue = "100") int limit) {
        return ResponseEntity.ok(chatService.getRecentMessages(room, limit));
    }
}
