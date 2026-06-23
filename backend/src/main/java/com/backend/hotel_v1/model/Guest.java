package com.backend.hotel_v1.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Table(name = "guests")
@Entity
@Getter
@Setter
public class Guest extends Person {

    @JsonIgnore
    @OneToMany(mappedBy = "guest", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<Reservation> reservations;

    // Sobrecarga de construtores
    public Guest() {
        super();
    }

    public Guest(String name) {
        super();
        this.setName(name);
    }

    public Guest(String name, String cpf) {
        super();
        this.setName(name);
        this.setCpf(cpf);
    }

    public Guest(String name, String cpf, String phone, String email) {
        super(name, cpf, phone, email, true);
    }
}
