package com.backend.hotel_v1.domain.dto;

import com.backend.hotel_v1.domain.enums.RoomStatus;
import com.backend.hotel_v1.domain.enums.RoomTypes;

import java.util.UUID;

public record RoomResDto(UUID id, String roomNumber, RoomTypes roomType, Double dailyRate, RoomStatus roomStatus) {
}
