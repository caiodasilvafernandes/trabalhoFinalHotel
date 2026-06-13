package com.backend.hotel_v1.domain.enums;

public enum RoomTypes {
    SUITE("suite"),
    INDIVIDUAL("individual");

    private String types;

    RoomTypes(String role){
        this.types = role;
    }

    public String getTypes(){
        return types;
    }
}
