package com.backend.hotel_v1.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class Person extends BaseEntity {
    private String name;
    private String cpf;
    private String phone;
    private String email;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
