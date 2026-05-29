package com.fateczl.muttley.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;

@Component
public class ApiKeyInterceptor implements HandlerInterceptor {

    private static final Set<String> CHAVES_VALIDAS = Set.of(
            "cco123"
    );

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                             @NonNull HttpServletResponse response,
                             @NonNull Object handler) throws Exception {
        if (handler instanceof HandlerMethod handlerMethod) {
            if (handlerMethod.getMethodAnnotation(PublicRoute.class) != null) {
                return true;
            }
        }
        String apiKey = request.getHeader("X-API-KEY");
        if (apiKey == null || !CHAVES_VALIDAS.contains(apiKey)) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"erro\": \"API Key inválida ou ausente\"}");
            return false;
        }
        return true;
    }
}
