package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.ServiceConsumptionReqDto;
import com.backend.hotel_v1.domain.dto.ServiceConsumptionResDto;
import com.backend.hotel_v1.model.ServiceConsumption;
import com.backend.hotel_v1.service.ServiceConsumptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Consumo de Serviços", description = "Rota para requisições de consumo de serviços por estadia")
@RestController
@RequestMapping("/consumption")
public class ServiceConsumptionController {

    @Autowired
    private ServiceConsumptionService serviceConsumptionService;

    @Operation(summary = "Cria Consumo de Serviço",
               description = "Contém operações de serialização, validação e registro de consumo de serviço em uma estadia",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Consumo Registrado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = ServiceConsumption.class))))
    @PostMapping
    public ResponseEntity<ServiceConsumption> create(@RequestBody ServiceConsumptionReqDto req) {
        ServiceConsumption consumption = this.serviceConsumptionService.createConsumption(req);
        return ResponseEntity.ok(consumption);
    }

    @Operation(summary = "Lista Consumos com filtro",
               description = "Executa a operação de consulta com opção de filtros por estadia e serviço",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Lista de Consumos:",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = ServiceConsumptionResDto.class))))
    @GetMapping
    public ResponseEntity<List<ServiceConsumptionResDto>> listConsumptions(@RequestParam(defaultValue = "0") int pag,
                                                                            @RequestParam(defaultValue = "10") int tam,
                                                                            @RequestParam(required = false) UUID stayId,
                                                                            @RequestParam(required = false) UUID serviceId) {
        List<ServiceConsumptionResDto> consumptions = this.serviceConsumptionService.getFilteredConsumptions(pag, tam, stayId, serviceId);
        return ResponseEntity.ok(consumptions);
    }

    @Operation(summary = "Atualiza Consumo de Serviço",
               description = "Atualiza os dados de um consumo de serviço existente pelo seu identificador",
               responses = @ApiResponse(responseCode = "201",
                                        description = "Consumo Atualizado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = ServiceConsumption.class))))
    @PutMapping
    public ResponseEntity<ServiceConsumption> updateConsumption(@RequestParam UUID consumptionId,
                                                                 @RequestBody ServiceConsumptionReqDto req) {
        ServiceConsumption consumption = this.serviceConsumptionService.updateConsumption(consumptionId, req);
        return ResponseEntity.status(201).body(consumption);
    }

    @Operation(summary = "Deleta Consumo de Serviço",
               description = "Remove um registro de consumo de serviço do sistema pelo seu identificador",
               responses = @ApiResponse(responseCode = "200",
                                        description = "Consumo Deletado com Sucesso!",
                                        content = @Content(mediaType = "application/json",
                                                           schema = @Schema(implementation = String.class))))
    @DeleteMapping
    public ResponseEntity<String> deleteConsumption(@RequestParam UUID consumptionId) {
        this.serviceConsumptionService.deleteConsumption(consumptionId);
        return ResponseEntity.ok("Consumo deletado com sucesso.");
    }
}
