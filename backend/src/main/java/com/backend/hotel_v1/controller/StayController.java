package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.StayReqDto;
import com.backend.hotel_v1.domain.dto.StayResDto;
import com.backend.hotel_v1.model.Stay;
import com.backend.hotel_v1.service.StayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/stay")
public class StayController {

    @Autowired
    private StayService stayService;

    @PostMapping
    public ResponseEntity<Stay> create(@RequestBody StayReqDto req) {
        Stay stay = this.stayService.createStay(req);
        return ResponseEntity.ok(stay);
    }

    @GetMapping
    public ResponseEntity<List<StayResDto>> listStays(@RequestParam(defaultValue = "0") int pag,
                                                       @RequestParam(defaultValue = "10") int tam,
                                                       @RequestParam(required = false) UUID reservationId) {
        List<StayResDto> stays = this.stayService.getFilteredStays(pag, tam, reservationId);
        return ResponseEntity.ok(stays);
    }

    @PutMapping
    public ResponseEntity<Stay> updateStay(@RequestParam UUID idStay,
                                            @RequestBody StayReqDto req) {
        Stay stay = this.stayService.updateStay(idStay, req);
        return ResponseEntity.status(201).body(stay);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteStay(@RequestParam UUID idStay) {
        this.stayService.deleteStay(idStay);
        return ResponseEntity.ok("Estadia deletada com sucesso.");
    }
}
