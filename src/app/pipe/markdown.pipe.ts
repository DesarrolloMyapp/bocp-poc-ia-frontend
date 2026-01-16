import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
    // Configurar opciones de marked
    marked.setOptions({
      breaks: true, // Convierte saltos de línea simples en <br>
      gfm: true, // Habilita GitHub Flavored Markdown
    });
  }

  transform(value: string): SafeHtml {
    if (!value) return '';
    
    try {
      // Convertir markdown a HTML
      const html = marked.parse(value);
      // Sanitizar y devolver HTML seguro
      return this.sanitizer.sanitize(1, html) || '';
    } catch (error) {
      console.error('Error al parsear markdown:', error);
      // Si falla, devolver el texto tal cual con saltos de línea
      return value.replace(/\n/g, '<br>');
    }
  }
}
