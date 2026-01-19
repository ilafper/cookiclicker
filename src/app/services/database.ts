import { Injectable } from '@angular/core';

// Tipo para el usuario
export interface Usuario {
  id?: number;
  name: string;
  n_clicks: number;
}

// Declarar la API de Electron que expone preload.js
declare global {
  interface Window {
    electronAPI: {
      obtenerUsuarios: () => Promise<any[]>;
      crearUsuario: (usuario: any) => Promise<any>;
    };
  }
}

@Injectable({
  providedIn: 'root' // Disponible en toda la aplicación
})
export class DatabaseService {
  private usuarios: Usuario[] = [];
  
  constructor() {
    console.log('Servicio de base de datos inicializado');
  }
  
  async cargarUsuarios(): Promise<Usuario[]> {
   
    try {
      
      this.usuarios = await window.electronAPI.obtenerUsuarios();
      
      console.log('Usuarios cargados desde SQLite:', this.usuarios.length);
      return this.usuarios;
      
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      throw error;
    }
  }
  
  
  async agregarUsuario(name: string, clicks: number = 0): Promise<any> {
    console.log('Enviando nuevo usuario a Electron...');
    console.log("datos a guadar: "+ name, clicks);
    
    const nuevoUsuario: Usuario = {
      name: name,
      n_clicks: clicks
    };
    
    try {
      // 1. Angular envía datos a Electron
      const resultado = await window.electronAPI.crearUsuario(nuevoUsuario);
      
      console.log('Usuario creado en SQLite:', resultado);
      
     

      //actualizar
      await this.cargarUsuarios();
      
      return resultado;
      
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }
}