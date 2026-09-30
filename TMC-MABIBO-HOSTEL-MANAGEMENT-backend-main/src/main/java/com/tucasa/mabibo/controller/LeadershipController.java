package com.tucasa.mabibo.controller;

import com.tucasa.mabibo.dto.response.PositionResponse;
import com.tucasa.mabibo.dto.response.RegimeResponse;
import com.tucasa.mabibo.service.LeadershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leadership")
@RequiredArgsConstructor
public class LeadershipController {

    private final LeadershipService leadershipService;

    @GetMapping("/current")
    public ResponseEntity<List<PositionResponse>> getCurrentLeadership() {
        return ResponseEntity.ok(leadershipService.getAllPositions());
    }

    @GetMapping("/past")
    public ResponseEntity<List<RegimeResponse>> getPastLeadership() {
        return ResponseEntity.ok(leadershipService.getPastRegimes());
    }
}