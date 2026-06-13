--Repo GitHub: https://github.com/caiodasilvafernandes/trabalhoFinalHotel--

CREATE TABLE guests (
    idGuest uuid PRIMARY KEY,
    name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms (
    idRoom uuid PRIMARY KEY,
    room_number TEXT UNIQUE NOT NULL,
    room_type TEXT NOT NULL,
    daily_rate NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'LIVRE'
);

CREATE TABLE reservations (
    idResarvation uuid PRIMARY KEY,
    idGuest uuid NOT NULL,
    idRoom uuid NOT NULL,
    resarvationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    checkInDate DATE NOT NULL,
    checkOutDate DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT fk_reservations_guest
        FOREIGN KEY (idGuest)
        REFERENCES guests(idGuest),

    CONSTRAINT fk_reservations_room
        FOREIGN KEY (idRoom)
        REFERENCES rooms(idRoom)
);

CREATE TABLE stays (
    idStay uuid PRIMARY KEY,
    idResarvation uuid NOT NULL,
    actualCheckIn TIMESTAMP,
    actualCheckOut TIMESTAMP,

    CONSTRAINT fk_stays_reservation
        FOREIGN KEY (idResarvation)
        REFERENCES reservations(idResarvation)
);

CREATE TABLE services (
    idService uuid PRIMARY KEY,
    serviceName TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL
);

CREATE TABLE service_consumptions (
    consumptionId uuid PRIMARY KEY,
    idStay uuid NOT NULL,
    idService uuid NOT NULL,
    quantity int NOT NULL DEFAULT 1,

    CONSTRAINT fk_consumptions_stay
        FOREIGN KEY (idStay)
        REFERENCES stays(idStay),

    CONSTRAINT fk_consumptions_service
        FOREIGN KEY (idService)
        REFERENCES services(idService)
);
