package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.RoomReqDto;
import com.backend.hotel_v1.domain.dto.RoomResDto;
import com.backend.hotel_v1.domain.enums.RoomStatus;
import com.backend.hotel_v1.domain.enums.RoomTypes;
import com.backend.hotel_v1.domain.repositories.RoomRepository;
import com.backend.hotel_v1.exception.ResourceNotFoundException;
import com.backend.hotel_v1.model.Room;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RoomService implements CrudService<RoomResDto> {

    @Autowired
    private RoomRepository roomRepository;

    public RoomResDto createRoom(RoomReqDto data) {
        Room room = new Room();
        room.setRoomNumber(data.roomNumber());
        room.setRoomType(data.roomType());
        room.setDailyRate(data.dailyRate());
        room.setRoomStatus(data.roomStatus() != null ? data.roomStatus() : RoomStatus.LIVRE);
        roomRepository.save(room);
        return convertToResDto(room);
    }

    @Override
    public RoomResDto findById(UUID id) {
        return findById(id, false);
    }

    // Sobrecarga de método
    public RoomResDto findById(UUID id, boolean activeOnly) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado"));
        if (activeOnly && room.getRoomStatus() == RoomStatus.OCUPADO) {
            throw new ResourceNotFoundException("Quarto ocupado no momento");
        }
        return convertToResDto(room);
    }

    // Uso interno
    public Room findRoomEntity(UUID id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quarto não encontrado"));
    }

    public Page<RoomResDto> getFilteredRooms(String roomNumber, String roomStatus, String roomType, Pageable pageable) {
        roomNumber = (roomNumber != null) ? roomNumber : "";
        RoomStatus status = null;
        RoomTypes type = null;
        try { status = (roomStatus != null && !roomStatus.isEmpty()) ? RoomStatus.valueOf(roomStatus.toUpperCase()) : null; } catch (Exception ignored) {}
        try { type = (roomType != null && !roomType.isEmpty()) ? RoomTypes.valueOf(roomType.toUpperCase()) : null; } catch (Exception ignored) {}

        Page<Room> rooms = roomRepository.queryGetFilteredRooms(roomNumber, status, type, pageable);
        return rooms.map(this::convertToResDto);
    }

    public RoomResDto updateRoom(UUID id, RoomReqDto data) {
        Room room = findRoomEntity(id);
        room.setRoomNumber(data.roomNumber());
        room.setRoomType(data.roomType());
        room.setDailyRate(data.dailyRate());
        if (data.roomStatus() != null) room.setRoomStatus(data.roomStatus());
        roomRepository.save(room);
        return convertToResDto(room);
    }

    @Override
    public void delete(UUID id) {
        try {
            roomRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar quarto: " + e.getMessage());
        }
    }

    private RoomResDto convertToResDto(Room room) {
        return new RoomResDto(room.getId(), room.getRoomNumber(), room.getRoomType(), room.getDailyRate(), room.getRoomStatus());
    }
}
