import { Component, ChangeDetectorRef, NgZone  } from '@angular/core';
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

  tiempo: number = 5;

  intervalo: any;

  modal: boolean = false;
  modal_cero_cliks:boolean=false;

  mensajePerso: string="No has pulsado ninguna vez";
  constructor(private cdr: ChangeDetectorRef, private ngZone: NgZone) { }

  ngOnInit() {
    this.loadUsers();
  }

  sumar() {
    //usar ngzone para que angular detecte los cambios relaizados por que hay veces cuando haces clicks muy rapido no los detecta.
    this.ngZone.run(() => {
      this.total_cliks += 1;
      this.cdr.detectChanges(); // Forzar detección inmediata
      console.log('Click registrado:', this.total_cliks);
    });
  }








  async loadUsers() {
    try {
      const usuarios = await window.electron.invoke('get-users');
      this.lista_usuarios = usuarios;
      //si detecta un cambio actualiza la vista
      this.cdr.detectChanges();

      console.log('Usuarios cargados:', this.lista_usuarios);

    } catch (err) {
      console.error('Error cargando usuarios, reintentando...', err);
      setTimeout(() => this.loadUsers(), 200);
    }
  }

  iniciarTiempo() {
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

        if (this.total_cliks===0) {
          this.mostrarModal();
        }else if(this.total_cliks>0){
          this.mostrarModal2();
        }
       

      }
    }, 1000); // va de 1 en uno 1

  }


  mostrarModal() {
    this.modal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  mostrarModal2() {
    this.modal_cero_cliks = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }
  
  cerrarModal() {
    this.modal = false;
    document.body.style.overflow = 'auto';
    this.cdr.detectChanges();
    this.reiniciar();

  }

  reiniciar(){
    this.total_cliks=0;
  }


















}
