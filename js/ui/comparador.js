import { getOrCreateEstabelecimento } from '../utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('compareForm');
    const resultadoDiv = document.getElementById('resultado');
    const estabelecimentoSelect = document.getElementById('estabelecimentoSelect');
    const newEstabelecimentoNameInput = document.getElementById('newEstabelecimentoName');
    const marcaSelect = document.getElementById('marcaSelect');
    const newMarcaNameInput = document.getElementById('newMarcaName');

    

    async function populateEstabelecimentosSelect() {
        try {
            
            const { data, error } = await window.supabaseClient
                .from('estabelecimentos')
                .select('id, nome');

            console.log('Datos de establecimientos (comparador):', data);
            console.error('Error al cargar establecimientos (comparador):', error);

            if (error) throw error;

            // Sort establishments alphabetically by name
            data.sort((a, b) => a.nome.localeCompare(b.nome));

            // Construye las opciones como una cadena HTML
            let optionsHtml = '<option value="">Selecione um estabelecimento</option><option value="_new_">Adicionar novo estabelecimento</option>';
            data.forEach(estab => {
                optionsHtml += `<option value="${estab.nome}">${estab.nome}</option>`;
            });
            estabelecimentoSelect.innerHTML = optionsHtml;
            

        } catch (error) {
            console.error('Erro ao carregar estabelecimentos:', error);
            
        }
    }

    async function populateMarcaSelect() {
        try {
            
            const { data, error } = await window.supabaseClient
                .from('cervejas')
                .select('marca');

            console.log('Datos de marcas (comparador):', data);
            console.error('Error al cargar marcas (comparador):', error);

            if (error) throw error;

            const uniqueMarcas = [...new Set(data.map(item => item.marca))];
            uniqueMarcas.sort((a, b) => a.localeCompare(b));

            // Construye las opciones como una cadena HTML
            let optionsHtml = '<option value="">Selecione uma marca</option>';
            uniqueMarcas.forEach(marca => {
                optionsHtml += `<option value="${marca}">${marca}</option>`;
            });
            optionsHtml += '<option value="_new_">Outra (digite abaixo)</option>';
            marcaSelect.innerHTML = optionsHtml;
            

        } catch (error) {
            console.error('Erro ao carregar marcas de cerveja:', error);
            
            marcaSelect.innerHTML = '<option value="">Erro ao carregar marcas</option>';
        }
    }

    populateEstabelecimentosSelect();
    console.log('Estabelecimento Select innerHTML after populate (comparador):', estabelecimentoSelect.innerHTML);
    populateMarcaSelect();
    console.log('Marca Select innerHTML after populate (comparador):', marcaSelect.innerHTML);

    estabelecimentoSelect.addEventListener('change', () => {
        if (estabelecimentoSelect.value === '_new_') {
            newEstabelecimentoNameInput.style.display = 'block';
            newEstabelecimentoNameInput.setAttribute('required', 'true');
        } else {
            newEstabelecimentoNameInput.style.display = 'none';
            newEstabelecimentoNameInput.removeAttribute('required');
            newEstabelecimentoNameInput.value = '';
        }
    });

    marcaSelect.addEventListener('change', () => {
        if (marcaSelect.value === '_new_') {
            newMarcaNameInput.style.display = 'block';
            newMarcaNameInput.setAttribute('required', 'true');
        } else {
            newMarcaNameInput.style.display = 'none';
            newMarcaNameInput.removeAttribute('required');
            newMarcaNameInput.value = '';
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        let nomeEstabelecimento;
        if (estabelecimentoSelect.value === '_new_') {
            nomeEstabelecimento = newEstabelecimentoNameInput.value.trim();
        } else {
            nomeEstabelecimento = estabelecimentoSelect.value;
        }

        let marca;
        if (marcaSelect.value === '_new_') {
            marca = newMarcaNameInput.value.trim();
        } else {
            marca = marcaSelect.value;
        }

        const volume1 = parseInt(document.getElementById('volume1').value);
        const preco1 = parseFloat(document.getElementById('preco1').value);
        const volume2 = parseInt(document.getElementById('volume2').value);
        const preco2 = parseFloat(document.getElementById('preco2').value);

        

        try {
            const estabelecimento_id = await getOrCreateEstabelecimento(nomeEstabelecimento);

            const cervejasParaInserir = [
                { marca, volume: volume1, preco: preco1, estabelecimento_id },
                { marca, volume: volume2, preco: preco2, estabelecimento_id }
            ];

            await window.supabaseClient.from('cervejas').insert(cervejasParaInserir);

            const precoPorLitro1 = (preco1 / volume1) * 1000;
            const precoPorLitro2 = (preco2 / volume2) * 1000;

            let melhorOpcao, piorOpcao, economia;
            if (precoPorLitro1 < precoPorLitro2) {
                melhorOpcao = { nome: marca, volume: volume1, precoPorLitro: precoPorLitro1 };
                piorOpcao = { precoPorLitro: precoPorLitro2 };
            } else {
                melhorOpcao = { nome: marca, volume: volume2, precoPorLitro: precoPorLitro2 };
                piorOpcao = { precoPorLitro: precoPorLitro1 };
            }
            economia = piorOpcao.precoPorLitro - melhorOpcao.precoPorLitro;
            const percentualEconomia = economia > 0 ? (economia / piorOpcao.precoPorLitro) * 100 : 0;

            let resultadoHTML;

            if (economia > 0) {
                resultadoHTML = `
                <div class="resultado-content" style="padding: 30px; text-align: center;">
                    <div class="savings-badge" style="display: inline-block; padding: 12px 25px; border-radius: 50px; background-image: linear-gradient(to right, #00C851, #00A041); color: #fff; font-size: 1.4em; font-weight: 700; animation: pulse 2s infinite;">
                        Você vai economizar ${percentualEconomia.toFixed(0)}%!
                    </div>

                    <div class="savings-amount" style="font-size: 44px; font-weight: 900; color: #212529; margin: 20px 0 5px;">
                        R$ ${economia.toFixed(2)}
                    </div>
                    <p style="font-size: 1.2em; color: #6c757d; margin: 0 0 30px;">a menos por litro</p>

                    <div class="winner-product" style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 5px solid #00C851; text-align: left;">
                        <span style="font-size: 0.9em; font-weight: 700; color: #007a33; text-transform: uppercase; letter-spacing: 0.5px;">Melhor escolha</span>
                        <p style="font-size: 1.5em; font-weight: 700; color: #343a40; margin: 5px 0 0;">${melhorOpcao.nome} ${melhorOpcao.volume}ml</p>
                    </div>

                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #6c757d;">
                        <p>Preço por litro da Opção 1: R$ ${precoPorLitro1.toFixed(2)}</p>
                        <p>Preço por litro da Opção 2: R$ ${precoPorLitro2.toFixed(2)}</p>
                    </div>

                    <button class="btn-compare-again" onclick="window.location.reload();">Comparar outras</button>
                </div>
                `;
            } else {
                resultadoHTML = `
                <div class="resultado-content" style="padding: 30px; text-align: center;">
                     <div style="font-size: 3.5em; line-height: 1;">🤝</div>
                    <h2 style="font-family: 'Oswald', sans-serif; font-size: 2.2em; font-weight: 700; margin: 15px 0 10px; color: #495057;">É um empate!</h2>
                    <p style="font-size: 1.2em; margin: 0 0 20px; color: #555;">
                        Ambas cervejas têm o mesmo preço por litro.
                    </p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #6c757d;">
                        <p>Preço por litro da Opção 1: R$ ${precoPorLitro1.toFixed(2)}</p>
                        <p>Preço por litro da Opção 2: R$ ${precoPorLitro2.toFixed(2)}</p>
                    </div>
                    <button class="btn-compare-again" onclick="window.location.reload();">Comparar outras</button>
                </div>
                `;
            }

            resultadoDiv.innerHTML = resultadoHTML;

            resultadoDiv.classList.remove('hidden');
            form.reset();
            newEstabelecimentoNameInput.style.display = 'none';
            newMarcaNameInput.style.display = 'none';
            populateEstabelecimentosSelect();
            populateMarcaSelect();

        } catch (error) {
            console.error('Erro no processo de comparação:', error);
            
        }
    });
});
