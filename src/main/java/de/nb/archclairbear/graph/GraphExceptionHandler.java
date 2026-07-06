package de.nb.archclairbear.graph;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Graph-Fehlerbehandlung.
 */
@RestControllerAdvice
class GraphExceptionHandler {

  @ExceptionHandler(WorkspacePathNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  GraphErrorResponse workspacePathNotFound(final WorkspacePathNotFoundException exception) {
    return new GraphErrorResponse(exception.getMessage());
  }
}
