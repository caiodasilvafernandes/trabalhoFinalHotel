package com.backend.hotel_v1.model;

import com.backend.hotel_v1.domain.enums.RoomStatus;
import com.backend.hotel_v1.domain.enums.RoomTypes;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room extends BaseEntity {

    private String roomNumber;

    @Enumerated(EnumType.STRING)
    private RoomTypes roomType;

    private Double dailyRate;

    @Enumerated(EnumType.STRING)
    private RoomStatus roomStatus = RoomStatus.LIVRE;

    @JsonIgnore
    @OneToMany(mappedBy = "room", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Reservation> reservations;
}
