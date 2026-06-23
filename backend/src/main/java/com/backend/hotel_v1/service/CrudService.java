package com.backend.hotel_v1.service;

import java.util.UUID;

public interface CrudService<T> {
    T findById(UUID id);
    void delete(UUID id);
}
