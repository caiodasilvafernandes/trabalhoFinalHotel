package com.backend.hotel_v1.domain.dto;

import java.util.UUID;

public record ServiceConsumptionReqDto(UUID stayId, UUID serviceId, Integer quantity) {
}
