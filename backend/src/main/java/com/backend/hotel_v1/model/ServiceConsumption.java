package com.backend.hotel_v1.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "service_consumptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceConsumption extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "stay_id")
    private Stay stay;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;

    private Integer quantity = 1;
}
