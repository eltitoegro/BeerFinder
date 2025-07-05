import { getOrCreateEstabelecimento } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Debug: document.getElementById(\'marca\') at DOMContentLoaded:', document.getElementById('marca'));
    const form = document.getElementById('compareForm');
    const resultadoDiv = document.getElementById('resultado');
    const estabelecimentoSelect = document.getElementById('estabelecimentoSelect');
    const newEstabelecimentoNameInput = document.getElementById('newEstabelecimentoName');
    const marca = marcaInput.value.trim(); // Use the already fetched element
        console.log('Debug: marcaInput.value at point of use:', marcaInput.value);

    // Debugging: Check if elements are found
    if (!estabelecimentoSelect) console.error('Error: #estabelecimentoSelect not found.');
    if (!newEstabelecimentoNameInput) console.error('Error: #newEstabelecimentoName not found.');
    if (!marcaInput) console.error('Error: #marca not found.');

    async function populateEstabelecimentosSelect() {
        console.log('Debug: populateEstabelecimentosSelect called');
        if (!estabelecimentoSelect) {
            console.error('populateEstabelecimentosSelect: #estabelecimentoSelect is null. Cannot populate.');
            return;
        }


    populateEstabelecimentosSelect();

    estabelecimentoSelect.addEventListener('change', () => {
        if (!estabelecimentoSelect || !newEstabelecimentoNameInput) {
            console.error('Error: establishment select or new establishment input is null.');
            return;
        }
        if (estabelecimentoSelect.value === '_new_') {
            newEstabelecimentoNameInput.style.display = 'block';
            newEstabelecimentoNameInput.setAttribute('required', 'true');
        } else {
            newEstabelecimentoNameInput.style.display = 'none';
            newEstabelecimentoNameInput.removeAttribute('required');
            newEstabelecimentoNameInput.value = ''; // Clear the input if not adding new
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!estabelecimentoSelect || !marcaInput || !document.getElementById('volume1') || !document.getElementById('preco1') || !document.getElementById('volume2') || !document.getElementById('preco2')) {
            console.error('Error: One or more form elements are null. Cannot submit.');
            alert('Error interno: Faltan elementos del formulario. Por favor, recargue la página.');
            return;
        }

        let nomeEstabelecimento = '';
        if (estabelecimentoSelect.value === '_new_') {
            nomeEstabelecimento = newEstabelecimentoNameInput.value.trim();
        } else {
            nomeEstabelecimento = estabelecimentoSelect.value.trim();
        }