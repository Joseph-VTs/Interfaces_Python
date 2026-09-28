// ==========================================
// 1. GERENCIAMENTO DE INTERFACE E TELAS
// ==========================================
const btnMudarAcao = document.getElementById('btnMudarAcao');
const DivDeAddTarefa = document.getElementById('DivDeAddTarefa');
const DivDeSuport = document.getElementById('DivDeSuport');

let modoPesquisaAtivo = false;

function atualizarVisibilidadeFormularios() {
    const mostrarFormularioAdicionar = !modoPesquisaAtivo;

    DivDeAddTarefa.style.display = mostrarFormularioAdicionar ? 'none' : 'flex';
    DivDeSuport.style.display = mostrarFormularioAdicionar ? 'flex' : 'none';

    btnMudarAcao.innerHTML = mostrarFormularioAdicionar
        ? '<i class="fa-solid fa-circle-plus"></i> Nova Tarefa'
        : '<i class="fa-solid fa-magnifying-glass"></i> Pesquisar';
}

if (btnMudarAcao) {
    atualizarVisibilidadeFormularios();

    btnMudarAcao.addEventListener('click', () => {
        modoPesquisaAtivo = !modoPesquisaAtivo;
        atualizarVisibilidadeFormularios();
    });
}

// ==========================================
// 2. CONTROLE DO TEMA ESCURO (DARK MODE)
// ==========================================
const btnTema = document.getElementById('btnTema');

if (btnTema) {
    if (localStorage.getItem('temaEscuro') === 'ativo') {
        document.body.classList.add('dark-mode');
    }

    btnTema.addEventListener('click', (event) => {
        event.preventDefault();
        document.body.classList.toggle('dark-mode');

        const temaAtivo = document.body.classList.contains('dark-mode');
        localStorage.setItem('temaEscuro', temaAtivo ? 'ativo' : 'inativo');
        mostrarNotificacao(temaAtivo ? 'Modo Escuro Ativado! 🌙' : 'Modo Claro Ativado! ☀️');
    });
}

// ==========================================
// 3. BANCO DE DADOS LOCAL E ESTADOS
// ==========================================
let objetoListaDeTarefas = JSON.parse(localStorage.getItem('minhasTarefas')) || [];
let objetoLixeiraDeTarefas = JSON.parse(localStorage.getItem('minhasTarefasExcluidas')) || [];
let filtroStatusAtual = 'todos';

const btnNewTarefa = document.getElementById('btnNewTarefa');
const inputNewTarefa = document.getElementById('inputNewTarefa');
const divListaDeTarefas = document.getElementById('ListaDeTarefas');
const inputPesquisa = document.getElementById('inputPesquisa');
const selectFiltro = document.getElementById('selectFiltro');
const btnLimparTudo = document.getElementById('btnLimparTudo');
const contadorCaracteres = document.getElementById('contadorCaracteres');

const cardPendentes = document.getElementById('cardPendentes');
const cardConcluidas = document.getElementById('cardConcluidas');
const cardLixeira = document.getElementById('cardLixeira');

const qtdPendentes = document.getElementById('qtdPendentes');
const qtdConcluidas = document.getElementById('qtdConcluidas');
const qtdLixeira = document.getElementById('qtdLixeira');

function salvarNoLocalStorage() {
    localStorage.setItem('minhasTarefas', JSON.stringify(objetoListaDeTarefas));
    localStorage.setItem('minhasTarefasExcluidas', JSON.stringify(objetoLixeiraDeTarefas));
}

function atualizarContadores() {
    if (!qtdPendentes || !qtdConcluidas || !qtdLixeira) return;

    const pendentes = objetoListaDeTarefas.filter((tarefa) => !tarefa.Concluida).length;
    const concluidas = objetoListaDeTarefas.filter((tarefa) => tarefa.Concluida).length;
    const lixeira = objetoLixeiraDeTarefas.length;

    qtdPendentes.innerText = pendentes;
    qtdConcluidas.innerText = concluidas;
    qtdLixeira.innerText = lixeira;
}

// ==========================================
// 4. NOTIFICAÇÕES TOAST
// ==========================================
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const container = document.getElementById('container-notificacoes');
    if (!container) return;

    const toast = document.createElement('div');
    toast.classList.add('toast', tipo);

    let icone = '<i class="fa-solid fa-circle-check"></i>';
    if (tipo === 'aviso') icone = '<i class="fa-solid fa-circle-exclamation"></i>';
    if (tipo === 'perigo') icone = '<i class="fa-solid fa-trash-can"></i>';

    toast.innerHTML = `${icone} <span>${mensagem}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ==========================================
// 5. SISTEMA DE FILTROS POR CARDS
// ==========================================
function gerenciarEstiloCardsAtivos() {
    if (!cardPendentes || !cardConcluidas || !cardLixeira) return;

    cardPendentes.classList.remove('card-ativo');
    cardConcluidas.classList.remove('card-ativo');
    cardLixeira.classList.remove('card-ativo');

    if (filtroStatusAtual === 'pendentes') cardPendentes.classList.add('card-ativo');
    if (filtroStatusAtual === 'concluidas') cardConcluidas.classList.add('card-ativo');
    if (filtroStatusAtual === 'lixeira') cardLixeira.classList.add('card-ativo');
}

if (cardPendentes) {
    cardPendentes.addEventListener('click', () => {
        filtroStatusAtual = filtroStatusAtual === 'pendentes' ? 'todos' : 'pendentes';
        gerenciarEstiloCardsAtivos();
        renderizarTarefas();
    });
}

if (cardConcluidas) {
    cardConcluidas.addEventListener('click', () => {
        filtroStatusAtual = filtroStatusAtual === 'concluidas' ? 'todos' : 'concluidas';
        gerenciarEstiloCardsAtivos();
        renderizarTarefas();
    });
}

if (cardLixeira) {
    cardLixeira.addEventListener('click', () => {
        filtroStatusAtual = filtroStatusAtual === 'lixeira' ? 'todos' : 'lixeira';
        gerenciarEstiloCardsAtivos();
        renderizarTarefas();
    });
}

if (inputNewTarefa && contadorCaracteres) {
    inputNewTarefa.addEventListener('input', () => {
        const total = inputNewTarefa.value.length;
        contadorCaracteres.innerText = `${total} / 45 caracteres`;
        contadorCaracteres.style.color = total >= 40 ? '#ff4d4d' : total >= 30 ? '#e67e22' : '#555';
        contadorCaracteres.style.fontWeight = total >= 40 ? 'bold' : 'normal';
    });
}

// ==========================================
// 6. RENDERIZAÇÃO DA TABELA
// ==========================================
function renderizarTarefas() {
    if (!divListaDeTarefas) return;

    divListaDeTarefas.innerHTML = '';
    atualizarContadores();
    gerenciarEstiloCardsAtivos();

    let tarefasFiltradas = filtroStatusAtual === 'lixeira'
        ? [...objetoLixeiraDeTarefas]
        : [...objetoListaDeTarefas];

    const termoBusca = inputPesquisa ? inputPesquisa.value.trim().toLowerCase() : '';
    if (termoBusca) {
        tarefasFiltradas = tarefasFiltradas.filter((tarefa) => tarefa.Tarefa.toLowerCase().includes(termoBusca));
    }

    if (filtroStatusAtual === 'concluidas') {
        tarefasFiltradas = tarefasFiltradas.filter((tarefa) => tarefa.Concluida);
    } else if (filtroStatusAtual === 'pendentes') {
        tarefasFiltradas = tarefasFiltradas.filter((tarefa) => !tarefa.Concluida);
    }

    if (selectFiltro && selectFiltro.value === 'az') {
        tarefasFiltradas.sort((a, b) => a.Tarefa.localeCompare(b.Tarefa));
    }

    if (tarefasFiltradas.length === 0) {
        divListaDeTarefas.innerHTML = '<p class="lista-vazia">Nenhuma tarefa encontrada.</p>';
        return;
    }

    tarefasFiltradas.forEach((tarefa, index) => {
        const naLixeira = filtroStatusAtual === 'lixeira';

        const ul = document.createElement('ul');
        ul.className = `Tarefa ${tarefa.Concluida ? 'concluida-linha' : ''}`;
        ul.innerHTML = `
            <li>${index + 1}</li>
            <li class="texto-tarefa">
                <div id="containerTexto-${tarefa.id}">
                    <span class="nome-txt">${tarefa.Tarefa}</span>
                </div>
                <small class="data-criacao"><i class="fa-regular fa-clock"></i> ${tarefa.DataCriacao}</small>
            </li>
            <li class="status-badge-container">
                <span class="status-badge ${tarefa.Concluida ? 'concluidas' : 'pendente'}">
                    ${tarefa.Concluida ? 'Concluída' : 'Pendente'}
                </span>
            </li>
            <li>
                <input
                    type="checkbox"
                    class="ConcluirTarefa"
                    ${tarefa.Concluida ? 'checked' : ''}
                    ${naLixeira ? 'disabled' : ''}
                    onchange="alternarStatusTarefa(${tarefa.id})"
                >
            </li>
            <li>
                <div class="AcoesBotoes">
                    ${naLixeira ? `
                        <button class="btnRecuperar" onclick="recuperarTarefa(${tarefa.id})" title="Recuperar">
                            <i class="fa-solid fa-trash-arrow-up"></i>
                        </button>
                        <button class="btnDeletarDefinitivo" onclick="deletarDefinitivo(${tarefa.id})" title="Excluir Definitivamente">
                            <i class="fa-solid fa-rectangle-xmark"></i>
                        </button>
                    ` : `
                        <button class="btnEditar" id="btnEditar-${tarefa.id}" onclick="habilitarEdicao(${tarefa.id})" title="Editar">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btnDeletar" onclick="moverParaLixeira(${tarefa.id})" title="Mover para Lixeira">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `}
                </div>
            </li>
        `;

        divListaDeTarefas.appendChild(ul);
    });
}

// ==========================================
// 7. OPERAÇÕES DO CRUD
// ==========================================
if (btnNewTarefa) {
    btnNewTarefa.addEventListener('click', () => {
        const valor = inputNewTarefa.value.trim();
        if (!valor) {
            mostrarNotificacao('Não é possível adicionar uma tarefa vazia!', 'aviso');
            return;
        }

        const agora = new Date();
        const dataFormatada = agora.toLocaleDateString('pt-BR');
        const horaFormatada = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        objetoListaDeTarefas.unshift({
            id: Date.now(),
            Tarefa: valor,
            Concluida: false,
            DataCriacao: `${dataFormatada} às ${horaFormatada}`
        });

        inputNewTarefa.value = '';
        if (contadorCaracteres) {
            contadorCaracteres.innerText = '0 / 45 caracteres';
            contadorCaracteres.style.color = '#555';
            contadorCaracteres.style.fontWeight = 'normal';
        }

        salvarNoLocalStorage();
        renderizarTarefas();
        mostrarNotificacao('Tarefa adicionada com sucesso!');
    });
}

function alternarStatusTarefa(idTarefa) {
    const tarefa = objetoListaDeTarefas.find((item) => item.id === idTarefa);
    if (!tarefa) return;

    tarefa.Concluida = !tarefa.Concluida;
    salvarNoLocalStorage();
    renderizarTarefas();

    mostrarNotificacao(
        tarefa.Concluida ? 'Tarefa marcada como Concluída! 🎉' : 'Tarefa retornada para Pendente.',
        tarefa.Concluida ? 'sucesso' : 'aviso'
    );
}

function habilitarEdicao(idTarefa) {
    const tarefa = objetoListaDeTarefas.find((item) => item.id === idTarefa);
    if (!tarefa) return;

    const container = document.getElementById(`containerTexto-${idTarefa}`);
    const btnEditar = document.getElementById(`btnEditar-${idTarefa}`);
    if (!container || !btnEditar) return;

    container.innerHTML = `<input type="text" class="input-edicao" id="inputEdit-${idTarefa}" maxlength="45" value="${tarefa.Tarefa}">`;
    btnEditar.innerHTML = '<i class="fa-solid fa-check" style="color: #2db32d;"></i>';
    btnEditar.onclick = () => salvarEdicao(idTarefa);

    const inputElement = document.getElementById(`inputEdit-${idTarefa}`);
    if (!inputElement) return;

    inputElement.focus();
    inputElement.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') {
            salvarEdicao(idTarefa);
        }
    });
}

function salvarEdicao(idTarefa) {
    const tarefa = objetoListaDeTarefas.find((item) => item.id === idTarefa);
    const inputElement = document.getElementById(`inputEdit-${idTarefa}`);
    const novoTexto = inputElement ? inputElement.value.trim() : '';

    if (!tarefa) return;
    if (!novoTexto) {
        mostrarNotificacao('O texto da tarefa não pode ficar vazio!', 'aviso');
        return;
    }

    tarefa.Tarefa = novoTexto;
    salvarNoLocalStorage();
    renderizarTarefas();
    mostrarNotificacao('Tarefa atualizada!');
}

function moverParaLixeira(idTarefa) {
    const index = objetoListaDeTarefas.findIndex((tarefa) => tarefa.id === idTarefa);
    if (index === -1) return;

    const [removida] = objetoListaDeTarefas.splice(index, 1);
    objetoLixeiraDeTarefas.unshift(removida);
    salvarNoLocalStorage();
    renderizarTarefas();
    mostrarNotificacao('Tarefa movida para a lixeira.', 'aviso');
}

function recuperarTarefa(idTarefa) {
    const index = objetoLixeiraDeTarefas.findIndex((tarefa) => tarefa.id === idTarefa);
    if (index === -1) return;

    const [recuperada] = objetoLixeiraDeTarefas.splice(index, 1);
    objetoListaDeTarefas.push(recuperada);
    salvarNoLocalStorage();
    renderizarTarefas();
    mostrarNotificacao('Tarefa restaurada com sucesso!');
}

function deletarDefinitivo(idTarefa) {
    if (!confirm('Esta ação excluirá permanentemente esta tarefa. Continuar?')) return;

    objetoLixeiraDeTarefas = objetoLixeiraDeTarefas.filter((tarefa) => tarefa.id !== idTarefa);
    salvarNoLocalStorage();
    renderizarTarefas();
    mostrarNotificacao('Tarefa deletada permanentemente.', 'perigo');
}

if (btnLimparTudo) {
    btnLimparTudo.addEventListener('click', (event) => {
        event.preventDefault();

        if (objetoLixeiraDeTarefas.length === 0) {
            mostrarNotificacao('Sua lixeira já está vazia!', 'aviso');
            return;
        }

        if (!confirm('Deseja apagar definitivamente TODOS os itens que estão na lixeira?')) return;

        objetoLixeiraDeTarefas = [];
        salvarNoLocalStorage();
        renderizarTarefas();
        mostrarNotificacao('Lixeira esvaziada completamente.', 'perigo');
    });
}

if (inputPesquisa) {
    inputPesquisa.addEventListener('input', renderizarTarefas);
}

if (selectFiltro) {
    selectFiltro.addEventListener('change', renderizarTarefas);
}

renderizarTarefas();
