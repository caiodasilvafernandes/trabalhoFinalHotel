package com.backend.hotel_v1.model;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cupom")
@NoArgsConstructor
@AllArgsConstructor
@EnableJpaRepositories
public class Guest {
    @Id
    @GeneratedValue
    private UUID idguest;

    private String name;
    private String cpf;
    private String phone;

    private LocalDateTime created_at = LocalDateTime.now();
}
