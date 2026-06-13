package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.GuestReqDto;
import com.backend.hotel_v1.domain.dto.GuestResDto;
import com.backend.hotel_v1.model.Guest;
import com.backend.hotel_v1.service.GuestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/guest")
public class GuestController {

    @Autowired
    private GuestService guestService;

    @PostMapping
    public ResponseEntity<Guest> create(@RequestBody GuestReqDto req){
        Guest guest = this.guestService.createGuest(req);

        return ResponseEntity.ok(guest);
    }

    @GetMapping
    public ResponseEntity<List<GuestResDto>> listGuest(@RequestParam(defaultValue = "0") int pag,
                                                       @RequestParam(defaultValue = "0") int tam,
                                                       @RequestParam(defaultValue = "") String name,
                                                       @RequestParam(defaultValue = "") String cpf,
                                                       @RequestParam(defaultValue = "") String phone,
                                                       @RequestParam(defaultValue = "") String email){
        List<GuestResDto> guests = this.guestService.getFiltredGuests(pag, tam, name, cpf, phone, email);

        return ResponseEntity.ok(guests);
    }

    @PutMapping
    public ResponseEntity<Guest> updateGuest(@RequestParam(defaultValue = "") UUID idGuest,
                                             @RequestBody GuestReqDto req){
        if (idGuest == null){
            ResponseEntity.status(400).body("identificador do visitante não deve ser vazio");
        }

        Guest guest = this.guestService.updateGuest(idGuest, req);

        return ResponseEntity.status(201).body(guest);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteGuest(@RequestParam(defaultValue = "") UUID idGuest){
        if (idGuest == null){
            ResponseEntity.status(400).body("identificador do visitante não deve ser vazio");
        }

        this.guestService.deleteGuest(idGuest);

        return ResponseEntity.status(200).body("Visitante deletado com sucesso.");
    }
}
