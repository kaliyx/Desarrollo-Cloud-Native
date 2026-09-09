import { Component } from '@angular/core';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1>403 - Acceso Denegado</h1>
      <p>No tienes permisos para acceder a esta página.</p>
      <a href="/">Volver al Inicio</a>
    </div>
  `
})
export class AccessDeniedComponent {}
