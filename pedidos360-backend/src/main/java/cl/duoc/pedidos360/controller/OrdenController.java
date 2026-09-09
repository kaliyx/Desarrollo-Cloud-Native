package cl.duoc.pedidos360.controller;

import cl.duoc.pedidos360.model.DetallePedido;
import cl.duoc.pedidos360.model.Orden;
import cl.duoc.pedidos360.model.Orden.EstadoOrden;
import cl.duoc.pedidos360.service.OrdenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ordenes")
@RequiredArgsConstructor
public class OrdenController {

    private final OrdenService ordenService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<Orden> crearOrden(@RequestBody Orden orden) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ordenService.crearOrden(orden));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Orden> obtenerOrden(@PathVariable Long id) {
        return ordenService.obtenerOrdenPorId(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Orden>> obtenerTodasLasOrdenes() {
        return ResponseEntity.ok(ordenService.obtenerTodasLasOrdenes());
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<Orden>> obtenerOrdenesPorCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(ordenService.obtenerOrdenesPorCliente(clienteId));
    }

    @GetMapping("/estado/{estado}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Orden>> obtenerOrdenesPorEstado(@PathVariable EstadoOrden estado) {
        return ResponseEntity.ok(ordenService.obtenerOrdenesPorEstado(estado));
    }

    @PostMapping("/{id}/detalles")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<Orden> agregarDetalle(@PathVariable Long id, @RequestBody DetallePedido detalle) {
        try {
            return ResponseEntity.ok(ordenService.agregarDetalleAOrden(id, detalle));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Orden> cambiarEstado(@PathVariable Long id, @RequestParam EstadoOrden nuevoEstado) {
        try {
            return ResponseEntity.ok(ordenService.cambiarEstadoOrden(id, nuevoEstado));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarOrden(@PathVariable Long id) {
        ordenService.eliminarOrden(id);
        return ResponseEntity.noContent().build();
    }
}
