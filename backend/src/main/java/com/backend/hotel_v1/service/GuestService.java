package com.backend.hotel_v1.service;

import com.backend.hotel_v1.domain.dto.GuestReqDto;
import com.backend.hotel_v1.domain.dto.GuestResDto;
import com.backend.hotel_v1.domain.repositories.GuestRepository;
import com.backend.hotel_v1.exception.ResourceNotFoundException;
import com.backend.hotel_v1.model.Guest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class GuestService implements CrudService<GuestResDto> {

    @Autowired
    private GuestRepository guestRepository;

    public GuestResDto createGuest(GuestReqDto data) {
        Guest newGuest = new Guest(data.name(), data.cpf(), data.phone(), data.email());
        guestRepository.save(newGuest);
        return convertToResDto(newGuest);
    }

    @Override
    public GuestResDto findById(UUID id) {
        return findById(id, false);
    }

    // Sobrecarga de método
    public GuestResDto findById(UUID id, boolean activeOnly) {
        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóspede não encontrado"));
        if (activeOnly && Boolean.FALSE.equals(guest.getActive())) {
            throw new ResourceNotFoundException("Hóspede inativo");
        }
        return convertToResDto(guest);
    }

    // Uso interno de outros services que precisam da entidade
    public Guest findGuestEntity(UUID id) {
        return guestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hóspede não encontrado"));
    }

    public Page<GuestResDto> getFilteredGuests(String name, String cpf, String phone, String email, Pageable pageable) {
        name = (name != null) ? name : "";
        cpf = (cpf != null) ? cpf : "";
        phone = (phone != null) ? phone : "";
        email = (email != null) ? email : "";

        Page<Guest> listGuest = this.guestRepository.querygGetFiltredGuest(name, cpf, phone, email, pageable);
        return listGuest.map(this::convertToResDto);
    }

    public GuestResDto updateGuest(UUID id, GuestReqDto data) {
        Guest guest = findGuestEntity(id);
        guest.setName(data.name());
        guest.setCpf(data.cpf());
        guest.setPhone(data.phone());
        guest.setEmail(data.email());
        guestRepository.save(guest);
        return convertToResDto(guest);
    }

    @Override
    public void delete(UUID id) {
        try {
            guestRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao deletar hóspede: " + e.getMessage());
        }
    }

    private GuestResDto convertToResDto(Guest guest) {
        return new GuestResDto(guest.getId(), guest.getName(), guest.getCpf(), guest.getPhone(), guest.getEmail());
    }
}
