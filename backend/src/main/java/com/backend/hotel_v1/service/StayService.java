package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.StayReqDto;
import com.backend.hotel_v1.domain.dto.StayResDto;
import com.backend.hotel_v1.domain.repositories.StayRepository;
import com.backend.hotel_v1.exception.ResourceNotFoundException;
import com.backend.hotel_v1.model.Reservation;
import com.backend.hotel_v1.model.Stay;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class StayService implements CrudService<StayResDto> {

    @Autowired
    private StayRepository stayRepository;

    @Autowired
    private ReservationService reservationService;

    public StayResDto createStay(StayReqDto data) {
        Reservation reservation = reservationService.findReservationEntity(data.reservationId());

        Stay stay = new Stay();
        stay.setReservation(reservation);
        stay.setActualCheckIn(data.actualCheckIn());
        stay.setActualCheckOut(data.actualCheckOut());

        stayRepository.save(stay);
        return convertToResDto(stay);
    }

    @Override
    public StayResDto findById(UUID id) {
        return findById(id, false);
    }

    // Sobrecarga de método
    public StayResDto findById(UUID id, boolean activeOnly) {
        Stay stay = stayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estadia não encontrada"));
        return convertToResDto(stay);
    }

    public Stay findStayEntity(UUID id) {
        return stayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Estadia não encontrada"));
    }

    public Page<StayResDto> getFilteredStays(UUID reservationId, Pageable pageable) {
        Page<Stay> stays = stayRepository.queryGetFilteredStays(reservationId, pageable);
        return stays.map(this::convertToResDto);
    }

    public StayResDto updateStay(UUID id, StayReqDto data) {
        Stay stay = findStayEntity(id);
        Reservation reservation = reservationService.findReservationEntity(data.reservationId());

        stay.setReservation(reservation);
        stay.setActualCheckIn(data.actualCheckIn());
        stay.setActualCheckOut(data.actualCheckOut());

        stayRepository.save(stay);
        return convertToResDto(stay);
    }

    @Override
    public void delete(UUID id) {
        try {
            stayRepository.deleteStayById(id);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar estadia: " + e.getMessage());
        }
    }

    private StayResDto convertToResDto(Stay stay) {
        return new StayResDto(
                stay.getId(),
                stay.getReservation().getId(),
                stay.getActualCheckIn(),
                stay.getActualCheckOut()
        );
    }
}
