package com.backend.hotel_v1.domain.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record StayReqDto(UUID reservationId, LocalDateTime actualCheckIn, LocalDateTime actualCheckOut) {
}
