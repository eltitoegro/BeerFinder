
// js/config.js

// Prioriza las variables de entorno (para Netlify/producción)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Si las variables de entorno no están definidas (entorno de desarrollo local),
// puedes definirlas aquí para pruebas locales.
// **NO SUBAS ESTE ARCHIVO CON LAS CLAVES DESCOMENTADAS A UN REPOSITORIO PÚBLICO.**
/*
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("Variables de entorno no encontradas. Usando valores locales de config.js. No subas este archivo a producción.");
    SUPABASE_URL = 'https://pyxasozwdemvqobqzgua.supabase.co';
    SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5eGFzb3p3ZGVtdnFvYnF6Z3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2Njk3MTUsImV4cCI6MjA2NzI0NTcxNX0.E5YyelQf6JERlXYU6OSH8fjshqlYjlcS8AQMOQFE8-4';
}
*/
