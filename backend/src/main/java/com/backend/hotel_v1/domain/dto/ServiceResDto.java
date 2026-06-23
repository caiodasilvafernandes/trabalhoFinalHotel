package com.backend.hotel_v1.domain.dto;

import java.util.UUID;

public record ServiceResDto(UUID id, String serviceName, Double price) {
}
