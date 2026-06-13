package com.backend.hotel_v1.domain.dto;

import com.backend.hotel_v1.domain.enums.ReservationStatus;

import java.util.Date;
import java.util.UUID;

public record ReservationReqDto(UUID guestId, UUID roomId, Date checkInDate, Date checkOutDate, ReservationStatus status) {
}
