package com.backend.hotel_v1.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "stays")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Stay {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID idStay;

    @OneToOne
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;

    private LocalDateTime actualCheckIn;
    private LocalDateTime actualCheckOut;

    @JsonIgnore
    @OneToMany(mappedBy = "stay", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<ServiceConsumption> consumptions;
}
