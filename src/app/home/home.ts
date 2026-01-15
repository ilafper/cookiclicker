import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';


declare global {
  interface Window {
    electron: {
      invoke: (channel: string, args?: any) => Promise<any>;
    };
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {

  total_cliks: number = 0;
  lista_usuarios: any[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadUsers();
  }

  sumar() {
    this.total_cliks += 1;
  }

  

  async loadUsers() {
    try {
      const usuarios = await window.electron.invoke('get-users');     
      this.lista_usuarios = usuarios;
      //si detecta un cambio actualiza la vista
      this.cdr.detectChanges()

      console.log('Usuarios cargados:', this.lista_usuarios);

    } catch (err) {
      console.error('Error cargando usuarios, reintentando...', err);
      setTimeout(() => this.loadUsers(), 200);
    }
  }

  
}
