package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.ServiceReqDto;
import com.backend.hotel_v1.domain.dto.ServiceResDto;
import com.backend.hotel_v1.service.ServiceService;
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

@Tag(name = "Serviços", description = "Rota para requisições de serviços do hotel")
@RestController
@RequestMapping("/services")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    @Operation(summary = "Cria Serviço")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Criado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ServiceResDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping
    public ResponseEntity<ServiceResDto> create(@RequestBody ServiceReqDto req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(serviceService.createService(req));
    }

    @Operation(summary = "Busca Serviço por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Encontrado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ServiceResDto.class))),
            @ApiResponse(responseCode = "404", description = "Não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ServiceResDto> findById(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        return ResponseEntity.ok(serviceService.findById(id, activeOnly));
    }

    @Operation(summary = "Lista Serviços")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso!",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(
                                    schema = @Schema(implementation = ServiceResDto.class)
                            )
                    ))
    })
    @GetMapping
    public ResponseEntity<List<ServiceResDto>> listServices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "serviceName,asc") String sort,
            @RequestParam(defaultValue = "") String serviceName) {

        String[] sortParams = sort.split(",");

        Sort sortOrder = Sort.by(
                sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                sortParams[0]
        );

        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<ServiceResDto> services =
                serviceService.getFilteredServices(serviceName, pageable);

        return ResponseEntity.ok(services.getContent());
    }

    @Operation(summary = "Atualiza Serviço")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atualizado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = ServiceResDto.class)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<ServiceResDto> updateService(
            @PathVariable UUID id,
            @RequestBody ServiceReqDto req) {

        return ResponseEntity.ok(serviceService.updateService(id, req));
    }

    @Operation(summary = "Deleta Serviço")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Deletado com sucesso")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable UUID id) {
        serviceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}