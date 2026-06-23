package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.GuestReqDto;
import com.backend.hotel_v1.domain.dto.GuestResDto;
import com.backend.hotel_v1.service.GuestService;
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

@Tag(name = "Hóspedes", description = "Rota para requisições de hóspedes")
@RestController
@RequestMapping("/guests")
public class GuestController {

    @Autowired
    private GuestService guestService;

    @Operation(summary = "Cria Hóspede", description = "Criação de hóspedes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Hóspede criado com sucesso!",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = GuestResDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados da requisição inválidos")
    })
    @PostMapping
    public ResponseEntity<GuestResDto> create(@RequestBody GuestReqDto req) {
        GuestResDto guest = this.guestService.createGuest(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(guest);
    }

    @Operation(summary = "Busca Hóspede por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Hóspede encontrado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = GuestResDto.class))),
            @ApiResponse(responseCode = "404", description = "Hóspede não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<GuestResDto> findById(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        return ResponseEntity.ok(this.guestService.findById(id, activeOnly));
    }

    @Operation(summary = "Lista Hóspedes")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso!",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(
                                    schema = @Schema(implementation = GuestResDto.class)
                            )))
    })
    @GetMapping
    public ResponseEntity<List<GuestResDto>> listGuests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String sort,
            @RequestParam(defaultValue = "") String name,
            @RequestParam(defaultValue = "") String cpf,
            @RequestParam(defaultValue = "") String phone,
            @RequestParam(defaultValue = "") String email) {

        String[] sortParams = sort.split(",");

        Sort sortOrder = Sort.by(
                sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                sortParams[0]
        );

        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<GuestResDto> guests = this.guestService
                .getFilteredGuests(name, cpf, phone, email, pageable);

        return ResponseEntity.ok(guests.getContent());
    }

    @Operation(summary = "Atualiza Hóspede")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atualizado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = GuestResDto.class)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<GuestResDto> updateGuest(
            @PathVariable UUID id,
            @RequestBody GuestReqDto req) {

        return ResponseEntity.ok(this.guestService.updateGuest(id, req));
    }

    @Operation(summary = "Deleta Hóspede")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Deletado com sucesso")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuest(@PathVariable UUID id) {
        this.guestService.delete(id);
        return ResponseEntity.noContent().build();
    }
}