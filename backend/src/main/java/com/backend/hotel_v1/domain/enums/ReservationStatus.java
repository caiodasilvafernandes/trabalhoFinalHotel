package com.backend.hotel_v1.domain.enums;

public enum ReservationStatus {
    PENDENTE("pendente"),
    ENCERRADO("encerrado");

    private String status;

    ReservationStatus(String status){
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}
