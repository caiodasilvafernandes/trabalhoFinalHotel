package com.backend.hotel_v1.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringDocApiConfig {
    @Bean
    public OpenAPI openAPI(){
        return new OpenAPI()
                .info(
                        new Info()
                                .title("Rest API - Hotelaria")
                                .description("API para gestão de serviços de hotéis")
                                .contact(new Contact().name("Caio Fernandes"))
                );
    }
}
