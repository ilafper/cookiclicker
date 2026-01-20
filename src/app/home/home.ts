import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../services/database';
import { FormsModule } from '@angular/forms';

// Declarar la API de Electron que expone preload.js
declare global {
  interface Window {
    electronAPI: {
      obtenerUsuarios: () => Promise<any[]>;
      crearUsuario: (usuario: any) => Promise<any>;
    };
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {

  lista_imagenes_ranking=['SparxieN1Dorada.png','SparxieN2.png','SparxieN3.png','SparxieN4.png','SparxieN5.png'];

  

  total_cliks: number = 0;
  lista_usuarios: any[] = [];

  tiempo: number = 5;

  intervalo: any;

  modal: boolean = false;

  nombreGuardar: string = '';

  botonDesacctivado:boolean=true;

  regalos: any[] = [];
  mostrarRegalos: boolean = false;

  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone, private dbServcice: DatabaseService) { }

  ngOnInit() {
    this.loadUsers();
  }

  sumar() {
    this.total_cliks++;

    // Efecto visual en el botón
    const boton = document.querySelector('.boton');
    boton?.classList.add('clickeado');
    setTimeout(() => {
      boton?.classList.remove('clickeado');
    }, 10);

    // Mostrar animación de regalos
    this.mostrarAnimacionRegalos();
  }

  async loadUsers() {
    try {
      const usuarios = await this.dbServcice.cargarUsuarios();
      this.lista_usuarios = usuarios;
      //si detecta un cambio actualiza la vista
      this.cdr.detectChanges();

      console.log('Usuarios cargados:', this.lista_usuarios);

    } catch (err) {
      console.error('Error cargando usuarios, reintentando...', err);
      setTimeout(() => this.loadUsers(), 100);
    }
  }

  iniciarTiempo() {

    this.botonDesacctivado=false;

    if (this.intervalo) {
      clearInterval(this.intervalo);
    }

    //cuando vuelvas a pulsar el boton se pone de nuevo a el valor
    this.tiempo = 5;
    this.intervalo = setInterval(() => {
      console.log("Tiempo :", this.tiempo);
      this.tiempo--;
      this.cdr.detectChanges();

      if (this.tiempo === 0) {
        console.log("se acabo el tiempo");
        console.log("mostrando modal");
        clearInterval(this.intervalo);
        this.intervalo = null;
        this.cdr.detectChanges();
        this.mostrarModal();


      }
    }, 1000); // va de 1 en uno 1

  }


  mostrarModal() {
    this.modal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }



  cerrarModal() {
    this.modal = false;
    document.body.style.overflow = 'auto';
    this.cdr.detectChanges();
    this.reiniciar();

  }

  reiniciar() {
    this.total_cliks = 0;
    this.tiempo = 5;
    this.botonDesacctivado=true;
  }


  async guardarUsuario() {
    // Validar que haya nombre
    if (!this.nombreGuardar || this.nombreGuardar.trim().length === 0) {
      alert('Por favor, escribe tu nombre');
      return;
    }

    // Validar que haya clicks
    if (this.total_cliks === 0) {
      alert('No puedes guardar con 0 clicks');
      return;
    }

    console.log('Guardando usuario:', this.nombreGuardar, this.total_cliks);
    try {

      //servicio de la base de datos
      const resultado = await this.dbServcice.agregarUsuario(
        this.nombreGuardar.trim(),
        this.total_cliks
      );

      console.log('Resultado:', resultado);

      // Recargar la lista
      await this.loadUsers();
      this.reiniciar();
      // Cerrar modal 
      this.cerrarModal();
      this.nombreGuardar = '';

    } catch (error) {
      console.log("Nono EROROR");
      this.reiniciar();
      this.nombreGuardar = '';

    }
  }










  mostrarAnimacionRegalos() {
    this.mostrarRegalos = true;
    this.regalos = [];

    // Crear 8-12 regalos en posiciones aleatorias
    const cantidad = Math.floor(Math.random() * 5) + 8; // 8-12 regalos

    for (let i = 0; i < cantidad; i++) {
      this.regalos.push({
        id: i,
        left: Math.random() * 80 + 10 + '%', // 10% a 90%
        delay: Math.random() * 0.5 + 's', // Retardo aleatorio
        size: Math.random() * 15 + 20 + 'px' // Tamaño 20-35px
      });
    }

    // Ocultar después de la animación
    setTimeout(() => {
      this.mostrarRegalos = false;
      this.regalos = [];
    }, 2500);

  }
}
