package com.backend.hotel_v1.domain.repositories;

import com.backend.hotel_v1.model.Guest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface GuestRepository extends JpaRepository<Guest, UUID> {

    @Query("SELECT g FROM Guest g WHERE" +
           "(:name = '' OR g.name LIKE %:name%) AND" +
           "(:cpf = '' OR g.cpf LIKE %:cpf%) AND" +
           "(:phone = '' OR g.phone LIKE %:phone%) AND" +
           "(:email = '' OR g.email LIKE %:email%)")
    Page<Guest> querygGetFiltredGuest(@Param("name") String name,
                                      @Param("cpf") String cpf,
                                      @Param("phone") String phone,
                                      @Param("email") String email,
                                      Pageable pageable);

    // Métodos derivados para filtros
    Page<Guest> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Optional<Guest> findByCpf(String cpf);
}
