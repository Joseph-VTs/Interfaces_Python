const STORAGE_KEYS = {
    tarefas: 'minhasTarefas',
    lixeira: 'minhasTarefasExcluidas'
};

const refs = {
    btnMudarAcao: document.getElementById('btnMudarAcao'),
    divAddTarefa: document.getElementById('DivDeAddTarefa'),
    divSuport: document.getElementById('DivDeSuport'),
    btnNewTarefa: document.getElementById('btnNewTarefa'),
    inputNewTarefa: document.getElementById('inputNewTarefa'),
    divListaDeTarefas: document.getElementById('ListaDeTarefas'),
    inputPesquisa: document.getElementById('inputPesquisa'),
    selectFiltro: document.getElementById('selectFiltro'),
    btnLimparTudo: document.getElementById('btnLimparTudo'),
    contadorCaracteres: document.getElementById('contadorCaracteres'),
    cardPendentes: document.getElementById('cardPendentes'),
    cardConcluidas: document.getElementById('cardConcluidas'),
    cardLixeira: document.getElementById('cardLixeira'),
    qtdPendentes: document.getElementById('qtdPendentes'),
    qtdConcluidas: document.getElementById('qtdConcluidas'),
    qtdLixeira: document.getElementById('qtdLixeira')
};

let objetoListaDeTarefas = carregarLista(STORAGE_KEYS.tarefas);
let objetoLixeiraDeTarefas = carregarLista(STORAGE_KEYS.lixeira);
let filtroStatusAtual = 'todos';

function carregarLista(chave) {
    try {
        const dados = JSON.parse(localStorage.getItem(chave));
        return Array.isArray(dados) ? dados : [];
    } catch {
        return [];
    }
}

function salvarNoLocalStorage() {
    localStorage.setItem(STORAGE_KEYS.tarefas, JSON.stringify(objetoListaDeTarefas));
    localStorage.setItem(STORAGE_KEYS.lixeira, JSON.stringify(objetoLixeiraDeTarefas));
}

function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const container = document.getElementById('container-notificacoes');
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

function atualizarContadores() {
    refs.qtdPendentes.textContent = objetoListaDeTarefas.filter(tarefa => !tarefa.Concluida).length;
    refs.qtdConcluidas.textContent = objetoListaDeTarefas.filter(tarefa => tarefa.Concluida).length;
    refs.qtdLixeira.textContent = objetoLixeiraDeTarefas.length;
}

function gerenciarEstiloCardsAtivos() {
    refs.cardPendentes.classList.remove('card-ativo');
    refs.cardConcluidas.classList.remove('card-ativo');
    refs.cardLixeira.classList.remove('card-ativo');

    if (filtroStatusAtual === 'pendentes') refs.cardPendentes.classList.add('card-ativo');
    if (filtroStatusAtual === 'concluidas') refs.cardConcluidas.classList.add('card-ativo');
    if (filtroStatusAtual === 'lixeira') refs.cardLixeira.classList.add('card-ativo');
}

function configurarAlternanciaDeTelas() {
    refs.divAddTarefa.style.display = 'none';
    refs.divSuport.style.display = 'flex';

    refs.btnMudarAcao.addEventListener('click', () => {
        const estaEmPesquisa = refs.btnMudarAcao.innerHTML.includes('Pesquisar');

        if (estaEmPesquisa) {
            refs.btnMudarAcao.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Nova Tarefa';
            refs.divSuport.style.display = 'flex';
            refs.divAddTarefa.style.display = 'none';
        } else {
            refs.btnMudarAcao.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Pesquisar';
            refs.divAddTarefa.style.display = 'flex';
            refs.divSuport.style.display = 'none';
        }
    });
}

function configurarContadorDeCaracteres() {
    refs.inputNewTarefa.addEventListener('input', () => {
        const caracteresDigitados = refs.inputNewTarefa.value.length;
        refs.contadorCaracteres.textContent = `${caracteresDigitados} / 45 caracteres`;

        if (caracteresDigitados >= 40) {
            refs.contadorCaracteres.style.color = '#ff4d4d';
            refs.contadorCaracteres.style.fontWeight = 'bold';
        } else if (caracteresDigitados >= 30) {
            refs.contadorCaracteres.style.color = '#e67e22';
        } else {
            refs.contadorCaracteres.style.color = '#555';
            refs.contadorCaracteres.style.fontWeight = 'normal';
        }
    });
}

function configurarFiltrosDeCartoes() {
    refs.cardPendentes.addEventListener('click', () => {
        filtroStatusAtual = filtroStatusAtual === 'pendentes' ? 'todos' : 'pendentes';
        gerenciarEstiloCardsAtivos();
        renderizarTarefas();
    });

    refs.cardConcluidas.addEventListener('click', () => {
        filtroStatusAtual = filtroStatusAtual === 'concluidas' ? 'todos' : 'concluidas';
        gerenciarEstiloCardsAtivos();
        renderizarTarefas();
    });

    refs.cardLixeira.addEventListener('click', () => {
        filtroStatusAtual = filtroStatusAtual === 'lixeira' ? 'todos' : 'lixeira';
        gerenciarEstiloCardsAtivos();
        renderizarTarefas();
    });
}

function renderizarTarefas() {
    refs.divListaDeTarefas.innerHTML = '';
    atualizarContadores();
    gerenciarEstiloCardsAtivos();

    let tarefasFiltradas = filtroStatusAtual === 'lixeira'
        ? [...objetoLixeiraDeTarefas]
        : [...objetoListaDeTarefas];

    const termoBusca = refs.inputPesquisa.value.trim().toLowerCase();
    if (termoBusca) {
        tarefasFiltradas = tarefasFiltradas.filter(tarefa => tarefa.Tarefa.toLowerCase().includes(termoBusca));
    }

    if (filtroStatusAtual === 'concluidas') {
        tarefasFiltradas = tarefasFiltradas.filter(tarefa => tarefa.Concluida);
    } else if (filtroStatusAtual === 'pendentes') {
        tarefasFiltradas = tarefasFiltradas.filter(tarefa => !tarefa.Concluida);
    }

    if (refs.selectFiltro.value === 'az') {
        tarefasFiltradas.sort((a, b) => a.Tarefa.localeCompare(b.Tarefa));
    }

    if (tarefasFiltradas.length === 0) {
        refs.divListaDeTarefas.innerHTML = '<p class="lista-vazia">Nenhuma tarefa encontrada neste filtro.</p>';
        return;
    }

    tarefasFiltradas.forEach((tarefa, index) => {
        const estaNaLixeira = filtroStatusAtual === 'lixeira';

        const ul = document.createElement('ul');
        ul.className = `Tarefa ${tarefa.Concluida ? 'concluida-linha' : ''}`;
        ul.innerHTML = `
            <li>${index + 1}</li>
            <li class="texto-tarefa">
                <div id="containerTexto-${tarefa.id}">
                    <span class="nome-txt" id="spanTarefa-${tarefa.id}">${tarefa.Tarefa}</span>
                </div>
                <small class="data-criacao"><i class="fa-regular fa-clock"></i> ${tarefa.DataCriacao}</small>
            </li>
            <li class="status-badge-container">
                <span class="status-badge ${tarefa.Concluida ? 'concluida' : 'pendente'}">
                    ${tarefa.Concluida ? 'Concluída' : 'Pendente'}
                </span>
            </li>
            <li>
                <input
                    type="checkbox"
                    class="ConcluirTarefa"
                    ${tarefa.Concluida ? 'checked' : ''}
                    ${estaNaLixeira ? 'disabled' : ''}
                    onchange="alternarStatusTarefa(${tarefa.id})"
                >
            </li>
            <li>
                <div class="AcoesBotoes">
                    ${estaNaLixeira ? `
                        <button class="btnRecuperar" onclick="recuperarTarefa(${tarefa.id})" title="Recuperar Tarefa">
                            <i class="fa-solid fa-trash-arrow-up"></i>
                        </button>
                        <button class="btnDeletarDefinitivo" onclick="deletarDefinitivo(${tarefa.id})" title="Excluir Definitivamente">
                            <i class="fa-solid fa-rectangle-xmark"></i>
                        </button>
                    ` : `
                        <button class="btnEditar" id="btnEditar-${tarefa.id}" onclick="habilitarEdicao(${tarefa.id})" title="Editar Texto">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btnDeletar" onclick="moverParaLixeira(${tarefa.id})" title="Mover para Lixeira">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `}
                </div>
            </li>
        `;
        refs.divListaDeTarefas.appendChild(ul);
    });
}

function adicionarTarefa() {
    const valor = refs.inputNewTarefa.value.trim();
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

    refs.inputNewTarefa.value = '';
    refs.contadorCaracteres.textContent = '0 / 45 caracteres';
    refs.contadorCaracteres.style.color = '#555';
    refs.contadorCaracteres.style.fontWeight = 'normal';

    salvarNoLocalStorage();
    renderizarTarefas();
    mostrarNotificacao('Tarefa adicionada com sucesso!');
}

function alternarStatusTarefa(idTarefa) {
    const tarefa = objetoListaDeTarefas.find(item => item.id === idTarefa);
    if (!tarefa) return;

    tarefa.Concluida = !tarefa.Concluida;
    salvarNoLocalStorage();
    renderizarTarefas();

    if (tarefa.Concluida) {
        mostrarNotificacao('Tarefa marcada como Concluída! 🎉');
    } else {
        mostrarNotificacao('Tarefa retornada para Pendente.', 'aviso');
    }
}

function habilitarEdicao(idTarefa) {
    const tarefa = objetoListaDeTarefas.find(item => item.id === idTarefa);
    if (!tarefa) return;

    const container = document.getElementById(`containerTexto-${idTarefa}`);
    const btnEditar = document.getElementById(`btnEditar-${idTarefa}`);

    if (!container || !btnEditar) return;

    container.innerHTML = `<input type="text" class="input-edicao" id="inputEdit-${idTarefa}" maxlength="45" value="${tarefa.Tarefa}">`;
    btnEditar.innerHTML = '<i class="fa-solid fa-check" style="color: #2db32d;"></i>';
    btnEditar.onclick = () => salvarEdicao(idTarefa);

    const inputElement = document.getElementById(`inputEdit-${idTarefa}`);
    inputElement.focus();
    inputElement.addEventListener('keydown', (evento) => {
        if (evento.key === 'Enter') salvarEdicao(idTarefa);
    });
}

function salvarEdicao(idTarefa) {
    const tarefa = objetoListaDeTarefas.find(item => item.id === idTarefa);
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
    const tarefaIndex = objetoListaDeTarefas.findIndex(tarefa => tarefa.id === idTarefa);
    if (tarefaIndex === -1) return;

    const [tarefaRemovida] = objetoListaDeTarefas.splice(tarefaIndex, 1);
    objetoLixeiraDeTarefas.unshift(tarefaRemovida);
    salvarNoLocalStorage();
    renderizarTarefas();
    mostrarNotificacao('Tarefa movida para a lixeira.', 'aviso');
}

function recuperarTarefa(idTarefa) {
    const tarefaIndex = objetoLixeiraDeTarefas.findIndex(tarefa => tarefa.id === idTarefa);
    if (tarefaIndex === -1) return;

    const [tarefaRecuperada] = objetoLixeiraDeTarefas.splice(tarefaIndex, 1);
    objetoListaDeTarefas.push(tarefaRecuperada);
    salvarNoLocalStorage();
    renderizarTarefas();
    mostrarNotificacao('Tarefa restaurada com sucesso!');
}

function deletarDefinitivo(idTarefa) {
    if (!confirm('Esta ação excluirá permanentemente esta tarefa. Continuar?')) return;

    objetoLixeiraDeTarefas = objetoLixeiraDeTarefas.filter(tarefa => tarefa.id !== idTarefa);
    salvarNoLocalStorage();
    renderizarTarefas();
    mostrarNotificacao('Tarefa deletada permanentemente.', 'perigo');
}

function limparLixeira() {
    if (objetoLixeiraDeTarefas.length === 0) {
        mostrarNotificacao('Sua lixeira já está vazia!', 'aviso');
        return;
    }

    if (!confirm('Deseja apagar definitivamente TODOS os itens que estão na lixeira?')) return;

    objetoLixeiraDeTarefas = [];
    salvarNoLocalStorage();
    renderizarTarefas();
    mostrarNotificacao('Lixeira esvaziada completamente.', 'perigo');
}

function inicializarEventos() {
    refs.btnNewTarefa.addEventListener('click', adicionarTarefa);
    refs.btnLimparTudo.addEventListener('click', (evento) => {
        evento.preventDefault();
        limparLixeira();
    });
    refs.inputPesquisa.addEventListener('input', renderizarTarefas);
    refs.selectFiltro.addEventListener('change', renderizarTarefas);
}

configurarAlternanciaDeTelas();
configurarContadorDeCaracteres();
configurarFiltrosDeCartoes();
inicializarEventos();
renderizarTarefas();