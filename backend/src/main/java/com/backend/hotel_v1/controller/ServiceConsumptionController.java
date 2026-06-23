package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.ServiceConsumptionReqDto;
import com.backend.hotel_v1.domain.dto.ServiceConsumptionResDto;
import com.backend.hotel_v1.service.ServiceConsumptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Tag(name = "Consumo de Serviços", description = "Rota para requisições de consumo de serviços por estadia")
@RestController
@RequestMapping("/consumptions")
public class ServiceConsumptionController {

    @Autowired
    private ServiceConsumptionService serviceConsumptionService;

    @Operation(summary = "Cria Consumo de Serviço")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Criado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ServiceConsumptionResDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping
    public ResponseEntity<ServiceConsumptionResDto> create(
            @RequestBody ServiceConsumptionReqDto req) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceConsumptionService.createConsumption(req));
    }

    @Operation(summary = "Busca Consumo por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Encontrado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ServiceConsumptionResDto.class))),
            @ApiResponse(responseCode = "404", description = "Não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ServiceConsumptionResDto> findById(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        return ResponseEntity.ok(
                serviceConsumptionService.findById(id, activeOnly)
        );
    }

    @Operation(summary = "Lista Consumos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso!",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(
                                    schema = @Schema(implementation = ServiceConsumptionResDto.class)
                            )
                    ))
    })
    @GetMapping
    public ResponseEntity<List<ServiceConsumptionResDto>> listConsumptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "quantity,asc") String sort,
            @RequestParam(required = false) UUID stayId,
            @RequestParam(required = false) UUID serviceId) {

        String[] sortParams = sort.split(",");

        Sort sortOrder = Sort.by(
                sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                sortParams[0]
        );

        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<ServiceConsumptionResDto> consumptions =
                serviceConsumptionService.getFilteredConsumptions(stayId, serviceId, pageable);

        return ResponseEntity.ok(consumptions.getContent());
    }

    @Operation(summary = "Atualiza Consumo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atualizado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ServiceConsumptionResDto.class)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<ServiceConsumptionResDto> updateConsumption(
            @PathVariable UUID id,
            @RequestBody ServiceConsumptionReqDto req) {

        return ResponseEntity.ok(
                serviceConsumptionService.updateConsumption(id, req)
        );
    }

    @Operation(summary = "Deleta Consumo")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Deletado com sucesso")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConsumption(@PathVariable UUID id) {
        serviceConsumptionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}