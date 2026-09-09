package cl.duoc.pedidos360.repository;

import cl.duoc.pedidos360.model.Orden;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrdenRepository extends JpaRepository<Orden, Long> {
    List<Orden> findByClienteId(Long clienteId);
    List<Orden> findByEstado(Orden.EstadoOrden estado);
}
