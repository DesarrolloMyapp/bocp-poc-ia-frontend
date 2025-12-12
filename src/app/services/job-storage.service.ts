import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JobStorageService {
  private readonly JOBS_KEY = 'processing_jobs';

  constructor() { }

  /**
   * Obtiene todos los job IDs almacenados
   */
  getJobIds(): string[] {
    const storedJobs = localStorage.getItem(this.JOBS_KEY);
    return storedJobs ? JSON.parse(storedJobs) : [];
  }

  /**
   * Almacena un nuevo job ID
   */
  addJobId(jobId: string): void {
    const existingJobs = this.getJobIds();
    
    // Evitar duplicados
    if (!existingJobs.includes(jobId)) {
      existingJobs.push(jobId);
      localStorage.setItem(this.JOBS_KEY, JSON.stringify(existingJobs));
    }
  }

  /**
   * Elimina un job ID específico
   */
  removeJob(jobId: string): void {
    const existingJobs = this.getJobIds();
    const filteredJobs = existingJobs.filter(id => id !== jobId);
    localStorage.setItem(this.JOBS_KEY, JSON.stringify(filteredJobs));
  }

  /**
   * Limpia todos los jobs almacenados
   */
  clearAllJobs(): void {
    localStorage.removeItem(this.JOBS_KEY);
  }

  /**
   * Obtiene la cantidad de jobs almacenados
   */
  getJobCount(): number {
    return this.getJobIds().length;
  }
} 