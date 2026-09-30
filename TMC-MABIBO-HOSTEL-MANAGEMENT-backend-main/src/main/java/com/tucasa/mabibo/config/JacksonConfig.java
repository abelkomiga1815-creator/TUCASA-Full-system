package com.tucasa.mabibo.config;

import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registers the Hibernate6 module with Spring Boot's Jackson ObjectMapper so
 * that JPA entities with lazy associations can be serialized safely. Without
 * it, response serialization of an entity containing an uninitialized lazy
 * proxy (e.g. {@code branch}, {@code createdBy}, {@code uploadedBy}) throws a
 * {@code LazyInitializationException} once the transaction (and thus the
 * Hibernate session) has closed, because {@code open-in-view=false}. Lazy
 * associations are instead serialized as {@code null} / omitted.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer hibernateCustomizer() {
        Hibernate6Module module = new Hibernate6Module();
        module.disable(Hibernate6Module.Feature.FORCE_LAZY_LOADING);
        return builder -> builder.modulesToInstall(module);
    }
}
