import { getOrCreateEstabelecimento } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('compareForm');
    const resultadoDiv = document.getElementById('resultado');
    const estabelecimentoSelect = document.getElementById('estabelecimentoSelect');
    const newEstabelecimentoNameInput = document.getElementById('newEstabelecimentoName');

    // Debugging: Check if elements are found
    if (!estabelecimentoSelect) console.error('Error: #estabelecimentoSelect not found.');
    if (!newEstabelecimentoNameInput) console.error('Error: #newEstabelecimentoName not found.');

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

        // Get elements inside the submit listener to ensure they are available
        const marca = document.getElementById('marca').value.trim();
        const volume1 = parseInt(document.getElementById('volume1').value);
        const preco1 = parseFloat(document.getElementById('preco1').value);
        const volume2 = parseInt(document.getElementById('volume2').value);
        const preco2 = parseFloat(document.getElementById('preco2').value);

        if (!estabelecimentoSelect || !marca || !volume1 || !preco1 || !volume2 || !preco2) {
            console.error('Error: One or more form elements are null or empty. Cannot submit.');
            alert('Error interno: Faltan elementos del formulario o campos obligatorios. Por favor, recargue la página.');
            return;
        }

        let nomeEstabelecimento = '';
        if (estabelecimentoSelect.value === '_new_') {
            nomeEstabelecimento = newEstabelecimentoNameInput.value.trim();
        } else {
            nomeEstabelecimento = estabelecimentoSelect.value.trim();
        }