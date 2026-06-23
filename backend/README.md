# Sistema de Gestão Hoteleira - Backend

Este projeto é uma API RESTful desenvolvida com Spring Boot para gerenciamento de serviços hoteleiros, cobrindo hóspedes, quartos, reservas, estadias, catálogo de serviços e consumo de serviços.

## Tecnologias Utilizadas

- **Java 21**
- **Spring Boot 4.x**
- **Spring Data JPA**
- **Spring Web**
- **H2 Database (Em Memória)**
- **Swagger/OpenAPI** (springdoc-openapi)
- **Lombok**
- **Maven**

## Estrutura do Projeto

O código do projeto segue a arquitetura em camadas padrão do Spring:

- `controller/`: Camada de exposição dos endpoints REST.
- `service/`: Camada de regras de negócio, implementando `CrudService<T>`.
- `repository/`: Camada de persistência com `JpaRepository`.
- `model/`: Entidades JPA que estendem `BaseEntity`.
- `dto/`: Records utilizados para transferência de dados nas requisições e respostas.
- `exception/`: Classes de tratamento de exceções global com `@RestControllerAdvice`.
- `config/`: Configurações de CORS e OpenAPI/Swagger.

## Como Executar o Projeto

1. Certifique-se de ter o **Java 21** instalado em sua máquina.
2. Certifique-se de que a porta `8080` está livre.
3. No terminal da pasta raiz do projeto, execute o comando correspondente ao seu sistema operacional:

### Windows (PowerShell/CMD):
```bash
./mvnw.cmd spring-boot:run
```

### Linux/macOS:
```bash
chmod +x mvnw
./mvnw spring-boot:run
```

---

## Acesso às Ferramentas Auxiliares

Após iniciar o servidor (`http://localhost:8080`):

### 1. Documentação Swagger/OpenAPI:
- **URL**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- Utilizada para testar as rotas de forma interativa e verificar as especificações técnicas da API.

### 2. Console do Banco de Dados H2:
- **URL**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- **JDBC URL**: `jdbc:h2:mem:hoteldb`
- **Username**: `sa`
- **Password**: *(deixe em branco)*

---

## Exemplos de Endpoints e JSONs

Abaixo estão alguns exemplos de uso da API. Uma coleção do Postman pronta para importação também está disponível em [hotel_api_postman_collection.json](./hotel_api_postman_collection.json).

### 1. Hóspedes (Guests)
#### Criar Hóspede
- **POST** `/guests`
- **Request Body (JSON)**:
```json
{
  "name": "Eduardo Frigo",
  "cpf": "123.456.789-10",
  "phone": "(41) 99999-8888",
  "email": "eduardo.frigo@example.com"
}
```
- **Response (201 Created)**:
```json
{
  "id": "e932b130-9b48-4cb2-a7cb-8c6fa2e7d7ff",
  "name": "Eduardo Frigo",
  "cpf": "123.456.789-10",
  "phone": "(41) 99999-8888",
  "email": "eduardo.frigo@example.com"
}
```

#### Listar Hóspedes Paginados e Filtrados
- **GET** `/guests?page=0&size=5&sort=name,asc&name=Eduardo`
- **Response (200 OK)**: Retorna um objeto de paginação do Spring contendo os hóspedes que possuem "Eduardo" no nome.

---

### 2. Quartos (Rooms)
#### Criar Quarto
- **POST** `/rooms`
- **Request Body (JSON)**:
```json
{
  "roomNumber": "204",
  "roomType": "SUITE",
  "dailyRate": 350.00,
  "roomStatus": "LIVRE"
}
```
- **Response (201 Created)**: Retorna o quarto criado com o seu correspondente ID.

#### Listar Quartos com Categoria (Filtro Personalizado)
- **GET** `/rooms?category=SUITE`
- **Response (200 OK)**: Retorna todos os quartos da categoria SUITE.

#### Ordenar Quartos por Preço
- **GET** `/rooms?sort=price,desc`
- **Response (200 OK)**: Retorna a lista de quartos ordenada de forma decrescente pelo preço (`dailyRate`).

---

### 3. Reservas (Reservations)
#### Criar Reserva
- **POST** `/reservations`
- **Request Body (JSON)**:
```json
{
  "guestId": "e932b130-9b48-4cb2-a7cb-8c6fa2e7d7ff",
  "roomId": "0982df41-11d2-43cb-b0cf-5b12dae722cb",
  "checkInDate": "2026-07-01T14:00:00.000+00:00",
  "checkOutDate": "2026-07-10T12:00:00.000+00:00",
  "status": "PENDENTE"
}
```

#### Filtrar Reservas por Status
- **GET** `/reservations?status=CONFIRMED`
- **Response (200 OK)**: Retorna as reservas cujo status seja CONFIRMADA.

---

### 4. Estadias (Stays)
#### Registrar Entrada (Check-In)
- **POST** `/stays`
- **Request Body (JSON)**:
```json
{
  "reservationId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "actualCheckIn": "2026-07-01T14:15:00",
  "actualCheckOut": null
}
```

---

### 5. Consumo de Serviços
#### Registrar Consumo
- **POST** `/consumptions`
- **Request Body (JSON)**:
```json
{
  "stayId": "UUID-DA-ESTADIA",
  "serviceId": "UUID-DO-SERVICO",
  "quantity": 3
}
```

---

## Tratamento de Exceções

A API possui um mecanismo centralizado que padroniza os erros:
- **404 Not Found**: Retornado se um recurso solicitado (hóspede, quarto, reserva, estadia, serviço) não existir.
- **400 Bad Request**: Retornado se houver violação de regras de negócio (`BusinessException`) ou parâmetros inválidos.
- **500 Internal Server Error**: Retornado para problemas inesperados no servidor.
