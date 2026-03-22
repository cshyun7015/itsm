package com.itsm.backend.service;

import com.itsm.backend.domain.Event;
import com.itsm.backend.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    // 🌟 sort(정렬 기준 컬럼)와 direction(asc/desc) 추가
    @Transactional(readOnly = true)
    public Page<Event> getEvents(int page, int size, String sort, String direction) {
        // String("asc" 또는 "desc")을 JPA의 Sort.Direction 객체로 변환
        Sort.Direction dir = Sort.Direction.fromString(direction);
        // 페이징 정보와 정렬 정보를 함께 묶어서 Pageable 생성
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sort));

        return eventRepository.findAll(pageable); // 기본 제공 메서드 활용
    }

    // ... (createEvent, updateEvent, deleteEvent는 기존과 완벽히 동일합니다)
    @Transactional
    public Event createEvent(Event event) {
        event.setStatus("NEW");
        return eventRepository.save(event);
    }

    @Transactional
    public Event updateEvent(Long id, Event updatedEvent) {
        return eventRepository.findById(id).map(event -> {
            event.setSource(updatedEvent.getSource());
            event.setSeverity(updatedEvent.getSeverity());
            event.setMessage(updatedEvent.getMessage());
            event.setNode(updatedEvent.getNode());
            event.setStatus(updatedEvent.getStatus());
            return eventRepository.save(event);
        }).orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다. ID: " + id));
    }

    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new IllegalArgumentException("이벤트를 찾을 수 없습니다. ID: " + id);
        }
        eventRepository.deleteById(id);
    }
}