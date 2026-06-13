package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.ServiceConsumptionReqDto;
import com.backend.hotel_v1.domain.dto.ServiceConsumptionResDto;
import com.backend.hotel_v1.model.ServiceConsumption;
import com.backend.hotel_v1.service.ServiceConsumptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/consumption")
public class ServiceConsumptionController {

    @Autowired
    private ServiceConsumptionService serviceConsumptionService;

    @PostMapping
    public ResponseEntity<ServiceConsumption> create(@RequestBody ServiceConsumptionReqDto req) {
        ServiceConsumption consumption = this.serviceConsumptionService.createConsumption(req);
        return ResponseEntity.ok(consumption);
    }

    @GetMapping
    public ResponseEntity<List<ServiceConsumptionResDto>> listConsumptions(@RequestParam(defaultValue = "0") int pag,
                                                                            @RequestParam(defaultValue = "10") int tam,
                                                                            @RequestParam(required = false) UUID stayId,
                                                                            @RequestParam(required = false) UUID serviceId) {
        List<ServiceConsumptionResDto> consumptions = this.serviceConsumptionService.getFilteredConsumptions(pag, tam, stayId, serviceId);
        return ResponseEntity.ok(consumptions);
    }

    @PutMapping
    public ResponseEntity<ServiceConsumption> updateConsumption(@RequestParam UUID consumptionId,
                                                                 @RequestBody ServiceConsumptionReqDto req) {
        ServiceConsumption consumption = this.serviceConsumptionService.updateConsumption(consumptionId, req);
        return ResponseEntity.status(201).body(consumption);
    }

    @DeleteMapping
    public ResponseEntity<String> deleteConsumption(@RequestParam UUID consumptionId) {
        this.serviceConsumptionService.deleteConsumption(consumptionId);
        return ResponseEntity.ok("Consumo deletado com sucesso.");
    }
}
