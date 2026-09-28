// Alternância de Telas (Pesquisa / Nova Tarefa)
const btnMudarAcao = document.getElementById('btnMudarAcao');
const DivDeAddTarefa = document.getElementById('DivDeAddTarefa');
const DivDeSuport = document.getElementById('DivDeSuport');

DivDeAddTarefa.style.display = 'none';
DivDeSuport.style.display = 'flex';

btnMudarAcao.addEventListener("click", () => {
    if (btnMudarAcao.innerHTML.includes("Pesquisar")) {
        btnMudarAcao.innerHTML = `<i class="fa-solid fa-circle-plus"></i> Nova Tarefa`;
        DivDeSuport.style.display = 'flex';
        DivDeAddTarefa.style.display = 'none';
    } else {
        btnMudarAcao.innerHTML = `<i class="fa-solid fa-magnifying-glass"></i> Pesquisar`;
        DivDeAddTarefa.style.display = 'flex';
        DivDeSuport.style.display = 'none';
    }
});

// Banco de Dados Local
let objetoListaDeTarefas = JSON.parse(localStorage.getItem('minhasTarefas')) || [];
let objetoLixeiraDeTarefas = JSON.parse(localStorage.getItem('minhasTarefasExcluidas')) || [];

const btnNewTarefa = document.getElementById('btnNewTarefa');
const inputNewTarefa = document.getElementById('inputNewTarefa');
const divListaDeTarefas = document.getElementById('ListaDeTarefas');
const inputPesquisa = document.getElementById('inputPesquisa');
const selectFiltro = document.getElementById('selectFiltro');
const btnLimparTudo = document.getElementById('btnLimparTudo');
const contadorCaracteres = document.getElementById('contadorCaracteres');

const qtdPendentes = document.getElementById('qtdPendentes');
const qtdConcluidas = document.getElementById('qtdConcluidas');
const qtdLixeira = document.getElementById('qtdLixeira');

// FUNÇÃO DO EFEITO VISUAL DE NOTIFICAÇÃO FLUTUANTE
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const container = document.getElementById('container-notificacoes');
    const toast = document.createElement('div');
    toast.classList.add('toast', tipo);

    // Define os ícones baseados no tipo de evento
    let icone = '<i class="fa-solid fa-circle-check"></i>';
    if (tipo === 'aviso') icone = '<i class="fa-solid fa-circle-exclamation"></i>';
    if (tipo === 'perigo') icone = '<i class="fa-solid fa-trash-can"></i>';

    toast.innerHTML = `${icone} <span>${mensagem}</span>`;
    container.appendChild(toast);

    // Remove automaticamente após 3 segundos com efeito de fade-out
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.4s ease forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function salvarNoLocalStorage() {
    localStorage.setItem('minhasTarefas', JSON.stringify(objetoListaDeTarefas));
    localStorage.setItem('minhasTarefasExcluidas', JSON.stringify(objetoLixeiraDeTarefas));
}

function atualizarContadores() {
    const pendentes = objetoListaDeTarefas.filter(t => !t.Concluida).length;
    const concluidas = objetoListaDeTarefas.filter(t => t.Concluida).length;
    const lixeira = objetoLixeiraDeTarefas.length;

    qtdPendentes.innerText = pendentes;
    qtdConcluidas.innerText = concluidas;
    qtdLixeira.innerText = lixeira;
}

// Contador e validação visual de limite de caracteres
inputNewTarefa.addEventListener('input', () => {
    const caracteresDigitados = inputNewTarefa.value.length;
    contadorCaracteres.innerText = `${caracteresDigitados} / 45 caracteres`;

    if (caracteresDigitados >= 40) {
        contadorCaracteres.style.color = '#ff4d4d';
        contadorCaracteres.style.fontWeight = 'bold';
    } else if (caracteresDigitados >= 30) {
        contadorCaracteres.style.color = '#e67e22';
    } else {
        contadorCaracteres.style.color = '#555';
        contadorCaracteres.style.fontWeight = 'normal';
    }
});

function renderizarTarefas() {
    divListaDeTarefas.innerHTML = '';
    atualizarContadores();

    const filtroAtivo = selectFiltro.value;
    let tarefasFiltradas = [];

    if (filtroAtivo === 'lixeira') {
        tarefasFiltradas = [...objetoLixeiraDeTarefas];
    } else {
        tarefasFiltradas = [...objetoListaDeTarefas];
    }

    const termoBusca = inputPesquisa.value.toLowerCase();
    tarefasFiltradas = tarefasFiltradas.filter(t => t.Tarefa.toLowerCase().includes(termoBusca));

    if (filtroAtivo === 'concluidas') {
        tarefasFiltradas = tarefasFiltradas.filter(t => t.Concluida);
    } else if (filtroAtivo === 'pendentes') {
        tarefasFiltradas = tarefasFiltradas.filter(t => !t.Concluida);
    } else if (filtroAtivo === 'az') {
        tarefasFiltradas.sort((a, b) => a.Tarefa.localeCompare(b.Tarefa));
    }

    if (tarefasFiltradas.length === 0) {
        divListaDeTarefas.innerHTML = `<p class="lista-vazia">Nenhuma tarefa encontrada.</p>`;
        return;
    }

    tarefasFiltradas.forEach((tarefa, index) => {
        const estaNaLixeira = (filtroAtivo === 'lixeira');

        divListaDeTarefas.innerHTML += `
            <ul class="Tarefa ${tarefa.Concluida ? 'concluida-linha' : ''}">
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
                    <input type="checkbox" class="ConcluirTarefa" 
                        ${tarefa.Concluida ? 'checked' : ''} 
                        ${estaNaLixeira ? 'disabled' : ''} 
                        onchange="alternarStatusTarefa(${tarefa.id})">
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
            </ul>
        `;
    });
}

// Adicionar tarefa
btnNewTarefa.addEventListener('click', () => {
    const valor = inputNewTarefa.value.trim();
    if (valor === '') {
        mostrarNotificacao("Não é possível adicionar uma tarefa vazia!", "aviso");
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
    contadorCaracteres.innerText = `0 / 45 caracteres`;
    contadorCaracteres.style.color = '#555';
    salvarNoLocalStorage();
    renderizarTarefas();
    mostrarNotificacao("Tarefa adicionada com sucesso!");
});

// Alterar checkbox
function alternarStatusTarefa(idTarefa) {
    const tarefa = objetoListaDeTarefas.find(t => t.id === idTarefa);
    if (tarefa) {
        tarefa.Concluida = !tarefa.Concluida;
        salvarNoLocalStorage();
        renderizarTarefas();

        if (tarefa.Concluida) {
            mostrarNotificacao("Tarefa marcada como Concluída! 🎉");
        } else {
            mostrarNotificacao("Tarefa retornada para Pendente.", "aviso");
        }
    }
}

function habilitarEdicao(idTarefa) {
    const tarefa = objetoListaDeTarefas.find(t => t.id === idTarefa);
    if (!tarefa) return;

    const container = document.getElementById(`containerTexto-${idTarefa}`);
    const btnEditar = document.getElementById(`btnEditar-${idTarefa}`);

    container.innerHTML = `<input type="text" class="input-edicao" id="inputEdit-${idTarefa}" maxlength="45" value="${tarefa.Tarefa}">`;
    btnEditar.innerHTML = `<i class="fa-solid fa-check" style="color: #2db32d;"></i>`;
    btnEditar.setAttribute("onclick", `salvarEdicao(${idTarefa})`);

    const inputElement = document.getElementById(`inputEdit-${idTarefa}`);
    inputElement.focus();
    inputElement.addEventListener("keypress", (e) => {
        if (e.key === "Enter") salvarEdicao(idTarefa);
    });
}

function salvarEdicao(idTarefa) {
    const tarefa = objetoListaDeTarefas.find(t => t.id === idTarefa);
    const novoTexto = document.getElementById(`inputEdit-${idTarefa}`).value.trim();

    if (novoTexto === '') {
        mostrarNotificacao("O texto da tarefa não pode ficar vazio!", "aviso");
        return;
    }

    if (tarefa) {
        tarefa.Tarefa = novoTexto;
        salvarNoLocalStorage();
        renderizarTarefas();
        mostrarNotificacao("Tarefa atualizada!");
    }
}

// Mover para lixeira
function moverParaLixeira(idTarefa) {
    const tarefaIndex = objetoListaDeTarefas.findIndex(t => t.id === idTarefa);
    if (tarefaIndex !== -1) {
        const [tarefaRemovida] = objetoListaDeTarefas.splice(tarefaIndex, 1); objetoLixeiraDeTarefas.unshift(tarefaRemovida); salvarNoLocalStorage(); renderizarTarefas(); mostrarNotificacao("Tarefa movida para a lixeira.", "aviso");
    }
}// Recuperar da lixeira
function recuperarTarefa(idTarefa) {
    const tarefaIndex = objetoLixeiraDeTarefas.findIndex(t => t.id === idTarefa);
    if (tarefaIndex !== -1) {
        const [tarefaRecuperada] = objetoLixeiraDeTarefas.splice(tarefaIndex, 1);
        objetoListaDeTarefas.push(tarefaRecuperada);
        salvarNoLocalStorage();
        renderizarTarefas();
        mostrarNotificacao("Tarefa restaurada com sucesso!");
    }
}

// Excluir de vez
function deletarDefinitivo(idTarefa) { if (confirm("Esta ação excluirá permanentemente esta tarefa. Continuar?")) { objetoLixeiraDeTarefas = objetoLixeiraDeTarefas.filter(t => t.id !== idTarefa); salvarNoLocalStorage(); renderizarTarefas(); mostrarNotificacao("Tarefa deletada permanentemente.", "perigo"); } }
// Limpar tudo do botão superior
btnLimparTudo.addEventListener('click', (e) => {
    e.preventDefault();
    if (objetoLixeiraDeTarefas.length === 0) {
        mostrarNotificacao("Sua lixeira já está vazia!", "aviso");
        return;
    }
    if (confirm("Deseja apagar definitivamente TODOS os itens que estão na lixeira?")) {
        objetoLixeiraDeTarefas = [];
        salvarNoLocalStorage();
        renderizarTarefas();
        mostrarNotificacao("Lixeira esvaziada completamente.", "perigo");
    }
});

inputPesquisa.addEventListener('input', renderizarTarefas);
selectFiltro.addEventListener('change', renderizarTarefas);
// Inicialização segurarenderizar
Tarefas();