package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.StayReqDto;
import com.backend.hotel_v1.domain.dto.StayResDto;
import com.backend.hotel_v1.service.StayService;
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

@Tag(name = "Estadias", description = "Rota para requisições de estadias")
@RestController
@RequestMapping("/stays")
public class StayController {

    @Autowired
    private StayService stayService;

    @Operation(summary = "Cria Estadia")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Criada com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = StayResDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping
    public ResponseEntity<StayResDto> create(@RequestBody StayReqDto req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(stayService.createStay(req));
    }

    @Operation(summary = "Busca Estadia por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Encontrada",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = StayResDto.class))),
            @ApiResponse(responseCode = "404", description = "Não encontrada")
    })
    @GetMapping("/{id}")
    public ResponseEntity<StayResDto> findById(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        return ResponseEntity.ok(
                stayService.findById(id, activeOnly)
        );
    }

    @Operation(summary = "Lista Estadias")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso!",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(
                                    schema = @Schema(implementation = StayResDto.class)
                            )
                    ))
    })
    @GetMapping
    public ResponseEntity<List<StayResDto>> listStays(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "actualCheckIn,asc") String sort,
            @RequestParam(required = false) UUID reservationId) {

        String[] sortParams = sort.split(",");

        Sort sortOrder = Sort.by(
                sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                sortParams[0]
        );

        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<StayResDto> stays =
                stayService.getFilteredStays(reservationId, pageable);

        return ResponseEntity.ok(stays.getContent());
    }

    @Operation(summary = "Atualiza Estadia")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atualizada com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = StayResDto.class)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<StayResDto> updateStay(
            @PathVariable UUID id,
            @RequestBody StayReqDto req) {

        return ResponseEntity.ok(
                stayService.updateStay(id, req)
        );
    }

    @Operation(summary = "Deleta Estadia")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Deletada com sucesso")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStay(@PathVariable UUID id) {
        stayService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
