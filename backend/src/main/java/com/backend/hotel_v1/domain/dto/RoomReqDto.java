package com.backend.hotel_v1.domain.dto;

import com.backend.hotel_v1.domain.enums.RoomStatus;
import com.backend.hotel_v1.domain.enums.RoomTypes;

public record RoomReqDto(String roomNumber, RoomTypes roomType, Double dailyRate, RoomStatus roomStatus) {
}
