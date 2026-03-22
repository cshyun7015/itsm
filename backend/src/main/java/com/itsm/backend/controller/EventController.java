package com.itsm.backend.controller;

import com.itsm.backend.domain.Event;
import com.itsm.backend.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class EventController {

    private final EventService eventService; // 🌟 Repository 대신 Service 주입!

    // 1. 조회: 정렬 파라미터 추가
    @GetMapping
    public ResponseEntity<Page<Event>> getEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sort,        // 🌟 기본 정렬 컬럼
            @RequestParam(defaultValue = "desc") String direction) // 🌟 기본 정렬 방향
    {
        return ResponseEntity.ok(eventService.getEvents(page, size, sort, direction));
    }

    @PostMapping
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        log.info("수동 이벤트 등록: {}", event.getMessage());
        return ResponseEntity.ok(eventService.createEvent(event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event updatedEvent) {
        log.info("이벤트 수정 요청 ID: {}", id);
        try {
            return ResponseEntity.ok(eventService.updateEvent(id, updatedEvent));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        log.info("이벤트 삭제 요청 ID: {}", id);
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}