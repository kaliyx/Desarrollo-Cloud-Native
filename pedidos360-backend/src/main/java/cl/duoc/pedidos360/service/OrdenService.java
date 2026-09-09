package cl.duoc.pedidos360.service;

import cl.duoc.pedidos360.model.DetallePedido;
import cl.duoc.pedidos360.model.Orden;
import cl.duoc.pedidos360.model.Orden.EstadoOrden;
import cl.duoc.pedidos360.repository.OrdenRepository;
import cl.duoc.pedidos360.repository.DetallePedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrdenService {

    private final OrdenRepository ordenRepository;
    private final DetallePedidoRepository detallePedidoRepository;

    public Orden crearOrden(Orden orden) {
        orden.setFechaCreacion(LocalDateTime.now());
        calcularTotalOrden(orden);
        return ordenRepository.save(orden);
    }

    public Optional<Orden> obtenerOrdenPorId(Long id) {
        return ordenRepository.findById(id);
    }

    public List<Orden> obtenerTodasLasOrdenes() {
        return ordenRepository.findAll();
    }

    public List<Orden> obtenerOrdenesPorCliente(Long clienteId) {
        return ordenRepository.findByClienteId(clienteId);
    }

    public List<Orden> obtenerOrdenesPorEstado(EstadoOrden estado) {
        return ordenRepository.findByEstado(estado);
    }

    public Orden agregarDetalleAOrden(Long ordenId, DetallePedido detalle) {
        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        
        detalle.setOrden(orden);
        detalle.calcularSubtotal();
        detallePedidoRepository.save(detalle);
        
        orden.getDetalles().add(detalle);
        calcularTotalOrden(orden);
        return ordenRepository.save(orden);
    }

    public Orden cambiarEstadoOrden(Long ordenId, EstadoOrden nuevoEstado) {
        Orden orden = ordenRepository.findById(ordenId)
            .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        
        orden.setEstado(nuevoEstado);
        orden.setFechaActualizacion(LocalDateTime.now());
        return ordenRepository.save(orden);
    }

    public void eliminarOrden(Long id) {
        ordenRepository.deleteById(id);
    }

    private void calcularTotalOrden(Orden orden) {
        BigDecimal total = orden.getDetalles().stream()
            .map(DetallePedido::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        orden.setTotal(total);
    }
}
