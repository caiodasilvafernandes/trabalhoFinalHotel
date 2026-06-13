package com.backend.hotel_v1.domain.enums;

public enum RoomStatus {
    LIVRE("livre"),
    OCUPADO("ocupado"),
    RESERVADO("reservado"),
    LIMPANDO("limpando");

    private String status;

    RoomStatus(String status){
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
