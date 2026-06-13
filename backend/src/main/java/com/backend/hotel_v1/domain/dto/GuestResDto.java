package com.backend.hotel_v1.domain.dto;

import com.backend.hotel_v1.model.Reservation;

import java.time.LocalDateTime;
import java.util.UUID;

public record GuestResDto(UUID idGuest, String name, String cpf, String phone, String email) {
}
