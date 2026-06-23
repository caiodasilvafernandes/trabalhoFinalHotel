package com.backend.hotel_v1.domain.dto;

import java.util.UUID;

public record GuestResDto(UUID id, String name, String cpf, String phone, String email) {
}
