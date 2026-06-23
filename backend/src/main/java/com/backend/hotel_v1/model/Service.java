package com.backend.hotel_v1.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Service extends BaseEntity {

    private String serviceName;
    private Double price;

    @JsonIgnore
    @OneToMany(mappedBy = "service", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private List<ServiceConsumption> consumptions;
}
