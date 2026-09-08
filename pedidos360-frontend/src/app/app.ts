import { Component, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus, AuthenticationResult } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  isLoggedIn = false;
  userName = '';
  backendUser: any = null;
  isAuthenticating = false;
  authError = '';
  httpAuthError = '';

  private msalService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);
  private readonly http = inject(HttpClient);
  private readonly _destroying$ = new Subject<void>();

  @HostListener('window:auth-http-error', ['$event'])
  onAuthHttpError(event: Event): void {
    const status = (event as CustomEvent<{ status: number }>).detail.status;
    this.httpAuthError = status === 401
      ? 'Tu sesión expiró. Inicia sesión nuevamente.'
      : 'No tienes permisos para acceder a este recurso.';
  }

  ngOnInit(): void {
    this.msalBroadcastService.inProgress$
      .pipe(
        takeUntil(this._destroying$)
      )
      .subscribe((status: InteractionStatus) => {
        this.isAuthenticating = status !== InteractionStatus.None && status !== InteractionStatus.Startup;
        if (status === InteractionStatus.None) {
          this.checkAccount();
          this.loadUserProfile(false);
        }
      });

    this.msalService.initialize().subscribe({
      next: () => {
        this.checkAccount();
        this.loadUserProfile(false);
      },
      error: (err) => {
        this.authError = 'No se pudo inicializar el inicio de sesión con Microsoft. Revisa la configuración de Azure.';
        console.error('Error al inicializar MSAL:', err);
      }
    });
  }

  checkAccount(): void {
    const activeAccount = this.msalService.instance.getActiveAccount();
    const accounts = this.msalService.instance.getAllAccounts();

    if (activeAccount) {
      this.isLoggedIn = true;
      this.userName = activeAccount.name || activeAccount.username || '';
    } else if (accounts.length > 0) {
      this.msalService.instance.setActiveAccount(accounts[0]);
      this.isLoggedIn = true;
      this.userName = accounts[0].name || accounts[0].username || '';
    } else {
      this.isLoggedIn = false;
      this.userName = '';
    }
  }

  login(): void {
    if (this.isAuthenticating) {
      return;
    }

    this.authError = '';
    this.isAuthenticating = true;

    this.msalService.loginPopup({
      scopes: environment.azure.loginScopes,
    }).subscribe({
      next: (result: AuthenticationResult) => {
        if (result.account) {
          this.msalService.instance.setActiveAccount(result.account);
        }
        this.checkAccount();
        this.loadUserProfile(true);
      },
      error: (err) => {
        this.isAuthenticating = false;
        this.authError = this.getAuthErrorMessage(err);
        console.error('Error en login popup:', err);
      },
      complete: () => {
        this.isAuthenticating = false;
      }
    });
  }

  private getAuthErrorMessage(error: unknown): string {
    const code = typeof error === 'object' && error !== null && 'errorCode' in error
      ? String((error as { errorCode: unknown }).errorCode)
      : '';

    if (code === 'popup_window_error' || code === 'empty_window_error') {
      return 'Microsoft no pudo abrir la ventana de inicio de sesión. Permite las ventanas emergentes para localhost e inténtalo nuevamente.';
    }

    if (code === 'interaction_in_progress') {
      return 'Ya existe un inicio de sesión en progreso. Cierra la ventana de Microsoft y vuelve a intentarlo.';
    }

    if (code === 'redirect_uri_mismatch') {
      return 'La URL actual no está registrada en Azure. Agrega el origen de esta página como URI de redirección SPA.';
    }

    return 'No se pudo iniciar sesión con Microsoft. Revisa la consola del navegador para ver el detalle.';
  }

  private loadUserProfile(allowInteraction: boolean): void {
    const activeAccount = this.msalService.instance.getActiveAccount();

    if (!activeAccount) {
      this.backendUser = null;
      return;
    }

    this.msalService.acquireTokenSilent({
      account: activeAccount,
      scopes: environment.azure.apiScopes,
    }).subscribe({
      next: () => this.fetchUserFromBackend(),
      error: (err) => {
        if (!allowInteraction) {
          this.authError = 'La sesión guardada necesita volver a autenticarse. Presiona Iniciar Sesión con Microsoft.';
          console.error('No se pudo obtener el token silenciosamente:', err);
          return;
        }

        this.msalService.acquireTokenPopup({
          account: activeAccount,
          scopes: environment.azure.apiScopes,
        }).subscribe({
          next: () => this.fetchUserFromBackend(),
          error: (err) => console.error('Error al obtener token de Azure AD:', err)
        });
      }
    });
  }

  private fetchUserFromBackend(): void {
    this.http.get(`${environment.azure.apiEndpoint}/api/me`).subscribe({
      next: (user) => {
        this.backendUser = user;
      },
      error: (err) => {
        console.error('Error al consultar el backend protegido:', err);
        this.backendUser = null;
      }
    });
  }

  logout(): void {
    this.isAuthenticating = false;
    this.backendUser = null;
    this.isLoggedIn = false;
    this.userName = '';
    this.authError = '';
    this.msalService.instance.setActiveAccount(null);

    this.msalService.logoutPopup({
      postLogoutRedirectUri: environment.azure.postLogoutRedirectUri,
    }).subscribe({
      error: (err) => {
        console.error('Error en logout popup:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this._destroying$.next();
    this._destroying$.complete();
  }
}
