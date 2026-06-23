package com.backend.hotel_v1.domain.enums;

public enum ReservationStatus {
    PENDENTE("pendente"),
    CONFIRMADA("confirmada"),
    ENCERRADO("encerrado"),
    CANCELADA("cancelada");

    private final String status;

    ReservationStatus(String status){
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
