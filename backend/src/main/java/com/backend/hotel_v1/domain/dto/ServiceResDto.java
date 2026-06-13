package com.backend.hotel_v1.domain.dto;

import java.util.UUID;

public record ServiceResDto(UUID idService, String serviceName, Double price) {
}
