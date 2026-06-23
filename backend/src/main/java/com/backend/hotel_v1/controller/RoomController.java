package com.backend.hotel_v1.controller;

import com.backend.hotel_v1.domain.dto.RoomReqDto;
import com.backend.hotel_v1.domain.dto.RoomResDto;
import com.backend.hotel_v1.service.RoomService;
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

@Tag(name = "Quartos", description = "Rota para requisições de quartos")
@RestController
@RequestMapping("/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Operation(summary = "Cria Quarto")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Quarto criado com sucesso!",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = RoomResDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    @PostMapping
    public ResponseEntity<RoomResDto> create(@RequestBody RoomReqDto req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roomService.createRoom(req));
    }

    @Operation(summary = "Busca Quarto por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Quarto encontrado",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = RoomResDto.class))),
            @ApiResponse(responseCode = "404", description = "Quarto não encontrado")
    })
    @GetMapping("/{id}")
    public ResponseEntity<RoomResDto> findById(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "false") boolean activeOnly) {

        return ResponseEntity.ok(roomService.findById(id, activeOnly));
    }

    @Operation(summary = "Lista Quartos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso!",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(
                                    schema = @Schema(implementation = RoomResDto.class)
                            )
                    ))
    })
    @GetMapping
    public ResponseEntity<List<RoomResDto>> listRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "roomNumber,asc") String sort,
            @RequestParam(defaultValue = "") String roomNumber,
            @RequestParam(defaultValue = "") String roomStatus,
            @RequestParam(defaultValue = "") String roomType,
            @RequestParam(defaultValue = "") String category) {

        String finalRoomType = roomType;
        if (finalRoomType.isEmpty() && !category.isEmpty()) {
            finalRoomType = category;
        }

        String[] sortParams = sort.split(",");
        String sortProp = sortParams[0];

        if (sortProp.equalsIgnoreCase("price")) {
            sortProp = "dailyRate";
        }

        Sort sortOrder = Sort.by(
                sortParams.length > 1 && sortParams[1].equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                sortProp
        );

        Pageable pageable = PageRequest.of(page, size, sortOrder);

        Page<RoomResDto> rooms =
                roomService.getFilteredRooms(roomNumber, roomStatus, finalRoomType, pageable);

        return ResponseEntity.ok(rooms.getContent());
    }

    @Operation(summary = "Atualiza Quarto")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Atualizado com sucesso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = RoomResDto.class)))
    })
    @PutMapping("/{id}")
    public ResponseEntity<RoomResDto> updateRoom(
            @PathVariable UUID id,
            @RequestBody RoomReqDto req) {

        return ResponseEntity.ok(roomService.updateRoom(id, req));
    }

    @Operation(summary = "Deleta Quarto")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Deletado com sucesso")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable UUID id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}