package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.RoomReqDto;
import com.backend.hotel_v1.domain.dto.RoomResDto;
import com.backend.hotel_v1.domain.enums.RoomStatus;
import com.backend.hotel_v1.domain.enums.RoomTypes;
import com.backend.hotel_v1.domain.repositories.RoomRepository;
import com.backend.hotel_v1.model.Room;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public Room createRoom(RoomReqDto data) {
        Room room = new Room();
        room.setRoomNumber(data.roomNumber());
        room.setRoomType(data.roomType());
        room.setDailyRate(data.dailyRate());
        room.setRoomStatus(data.roomStatus() != null ? data.roomStatus() : RoomStatus.LIVRE);
        roomRepository.save(room);
        return room;
    }

    public Room findRoom(UUID idRoom) {
        return roomRepository.findById(idRoom)
                .orElseThrow(() -> new IllegalArgumentException("Quarto não encontrado"));
    }

    public List<RoomResDto> getFilteredRooms(int pag, int tam, String roomNumber, String roomStatus, String roomType) {
        roomNumber = (roomNumber != null) ? roomNumber : "";
        RoomStatus status = null;
        RoomTypes type = null;
        try { status = (roomStatus != null && !roomStatus.isEmpty()) ? RoomStatus.valueOf(roomStatus) : null; } catch (IllegalArgumentException ignored) {}
        try { type = (roomType != null && !roomType.isEmpty()) ? RoomTypes.valueOf(roomType) : null; } catch (IllegalArgumentException ignored) {}

        Pageable pageable = PageRequest.of(pag, tam);
        Page<Room> rooms = roomRepository.queryGetFilteredRooms(roomNumber, status, type, pageable);
        return rooms.map(r -> new RoomResDto(r.getIdRoom(), r.getRoomNumber(), r.getRoomType(), r.getDailyRate(), r.getRoomStatus()))
                .stream().toList();
    }

    public Room updateRoom(UUID idRoom, RoomReqDto data) {
        Room room = findRoom(idRoom);
        room.setRoomNumber(data.roomNumber());
        room.setRoomType(data.roomType());
        room.setDailyRate(data.dailyRate());
        if (data.roomStatus() != null) room.setRoomStatus(data.roomStatus());
        roomRepository.save(room);
        return room;
    }

    public void deleteRoom(UUID idRoom) {
        try {
            roomRepository.deleteById(idRoom);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar quarto: " + e);
        }
    }
}
