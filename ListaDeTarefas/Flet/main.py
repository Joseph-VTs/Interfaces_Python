import json
from pathlib import Path

import flet as ft


ARQUIVO_TAREFAS = Path(__file__).with_name("tarefas.json")


tarefas = []
selected_task_id = None
page_ref = None
input_tarefa = None
lista_tarefas = None
mensagem = None
input_edicao = None
btn_salvar = None
btn_cancelar = None
app_container = None
titulo_app = None
contador_tarefas = None
badge_mobile = None
switch_tema = None
filtro_atual = "todos"
modo_escuro = False


def normalizar_tarefas(lista_bruta):
    tarefas_normalizadas = []
    ids_usados = set()
    proximo_id = 1

    for item in lista_bruta:
        if not isinstance(item, dict):
            continue

        titulo = str(item.get("titulo", "")).strip()
        if titulo == "":
            continue

        tarefa_id = item.get("id")
        try:
            tarefa_id = int(tarefa_id)
        except (TypeError, ValueError):
            tarefa_id = None

        if tarefa_id is None or tarefa_id in ids_usados:
            while proximo_id in ids_usados:
                proximo_id += 1
            tarefa_id = proximo_id
            proximo_id += 1

        ids_usados.add(tarefa_id)
        tarefas_normalizadas.append(
            {
                "id": tarefa_id,
                "titulo": titulo,
                "feito": bool(item.get("feito", False)),
            }
        )

        if tarefa_id >= proximo_id:
            proximo_id = tarefa_id + 1

    return tarefas_normalizadas


def carregar_tarefas():
    global tarefas

    if not ARQUIVO_TAREFAS.exists():
        tarefas = []
        return

    try:
        conteudo = ARQUIVO_TAREFAS.read_text(encoding="utf-8")
        dados = json.loads(conteudo) if conteudo.strip() else []
        tarefas = normalizar_tarefas(dados)

        if tarefas != dados:
            salvar_tarefas()
    except Exception:
        tarefas = []


def salvar_tarefas():
    try:
        ARQUIVO_TAREFAS.write_text(
            json.dumps(tarefas, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except Exception:
        pass


def atualizar_lista():
    if lista_tarefas is None or page_ref is None:
        return

    lista_tarefas.controls.clear()

    tarefas_visiveis = tarefas
    if filtro_atual == "pendentes":
        tarefas_visiveis = [t for t in tarefas if not t["feito"]]
    elif filtro_atual == "concluidas":
        tarefas_visiveis = [t for t in tarefas if t["feito"]]

    if not tarefas_visiveis:
        lista_tarefas.controls.append(
            ft.Container(
                content=ft.Text("Nenhuma tarefa para este filtro.", color=ft.Colors.GREY_700),
                padding=16,
                border_radius=12,
                bgcolor=ft.Colors.SURFACE_CONTAINER_LOW,
            )
        )
        page_ref.update()
        return

    for tarefa in tarefas_visiveis:
        lista_tarefas.controls.append(
            ft.Container(
                content=ft.Row(
                    [
                        ft.Checkbox(
                            value=tarefa["feito"],
                            label=tarefa["titulo"],
                            data=tarefa["id"],
                            on_change=lambda e: alternar_status(e.control.data),
                            label_style=ft.TextStyle(
                                decoration=ft.TextDecoration.LINE_THROUGH if tarefa["feito"] else None,
                                color=ft.Colors.GREEN_700 if tarefa["feito"] else ft.Colors.BLACK,
                            ),
                        ),
                        ft.Row(
                            [
                                ft.IconButton(
                                    icon=ft.Icons.EDIT,
                                    tooltip="Editar",
                                    data=tarefa["id"],
                                    on_click=lambda e: abrir_edicao(e.control.data),
                                ),
                                ft.IconButton(
                                    icon=ft.Icons.DELETE_OUTLINE,
                                    tooltip="Excluir",
                                    data=tarefa["id"],
                                    on_click=lambda e: excluir_tarefa(e.control.data),
                                ),
                            ],
                            spacing=0,
                        ),
                    ],
                    alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                ),
                border_radius=14,
                padding=12,
                margin=ft.Margin.only(bottom=8),
                bgcolor=ft.Colors.GREEN_50 if tarefa["feito"] else ft.Colors.WHITE,
                border=ft.Border.all(1, ft.Colors.OUTLINE_VARIANT),
            )
        )

    page_ref.update()


def mostrar_mensagem(texto, cor=ft.Colors.BLUE_500):
    mensagem.value = texto
    mensagem.color = cor
    page_ref.update()


def adicionar_tarefa(e):
    titulo = input_tarefa.value.strip()

    if titulo == "":
        mostrar_mensagem("Digite o nome da tarefa antes de adicionar.", ft.Colors.RED_500)
        return

    proximo_id = max((t["id"] for t in tarefas), default=0) + 1
    tarefas.append({"id": proximo_id, "titulo": titulo, "feito": False})
    salvar_tarefas()

    input_tarefa.value = ""
    mostrar_mensagem(f"Tarefa '{titulo}' adicionada com sucesso!", ft.Colors.GREEN_600)
    atualizar_lista()


def alternar_status(tarefa_id):
    for tarefa in tarefas:
        if tarefa["id"] == tarefa_id:
            tarefa["feito"] = not tarefa["feito"]
            texto = (
                f"Tarefa '{tarefa['titulo']}' marcada como concluída."
                if tarefa["feito"]
                else f"Tarefa '{tarefa['titulo']}' marcada como pendente."
            )
            salvar_tarefas()
            mostrar_mensagem(texto, ft.Colors.GREEN_600 if tarefa["feito"] else ft.Colors.BLUE_500)
            atualizar_lista()
            return


def abrir_edicao(tarefa_id):
    global selected_task_id

    selected_task_id = tarefa_id

    for tarefa in tarefas:
        if tarefa["id"] == tarefa_id:
            input_edicao.value = tarefa["titulo"]
            break

    input_edicao.visible = True
    btn_salvar.visible = True
    btn_cancelar.visible = True
    page_ref.update()


def salvar_edicao(e):
    global selected_task_id

    novo_titulo = input_edicao.value.strip()
    if novo_titulo == "":
        mostrar_mensagem("O novo nome da tarefa não pode ficar vazio.", ft.Colors.RED_500)
        return

    for tarefa in tarefas:
        if tarefa["id"] == selected_task_id:
            tarefa["titulo"] = novo_titulo
            mostrar_mensagem(f"Tarefa atualizada para '{novo_titulo}'.", ft.Colors.GREEN_600)
            break

    salvar_tarefas()
    limpar_edicao()
    atualizar_lista()


def limpar_edicao():
    global selected_task_id

    selected_task_id = None
    input_edicao.value = ""
    input_edicao.visible = False
    btn_salvar.visible = False
    btn_cancelar.visible = False
    page_ref.update()


def excluir_tarefa(tarefa_id):
    for tarefa in tarefas:
        if tarefa["id"] == tarefa_id:
            tarefas.remove(tarefa)
            salvar_tarefas()
            mostrar_mensagem(f"Tarefa '{tarefa['titulo']}' excluída.", ft.Colors.BLUE_500)
            atualizar_lista()
            return


def atualizar_filtro(filtro):
    global filtro_atual

    filtro_atual = filtro
    atualizar_lista()


def gerar_botao_filtro(texto, valor):
    selecionado = valor == filtro_atual
    return ft.Button(
        content=texto,
        on_click=lambda e, filtro=valor: atualizar_filtro(filtro),
        style=ft.ButtonStyle(
            shape=ft.RoundedRectangleBorder(radius=12),
            padding=ft.Padding(12, 10, 12, 10),
            bgcolor=ft.Colors.BLUE_500 if selecionado else ft.Colors.GREY_200,
            color=ft.Colors.WHITE if selecionado else ft.Colors.BLACK,
        ),
    )


def alternar_tema(ativo):
    global modo_escuro

    modo_escuro = ativo
    if page_ref is not None:
        page_ref.theme_mode = ft.ThemeMode.DARK if ativo else ft.ThemeMode.LIGHT
        atualizar_visual_tema()
        page_ref.update()


def atualizar_visual_tema():
    if page_ref is None:
        return

    if app_container is not None:
        app_container.bgcolor = ft.Colors.GREY_900 if modo_escuro else ft.Colors.WHITE
        app_container.border = ft.Border.all(1, ft.Colors.GREY_700 if modo_escuro else ft.Colors.GREY_200)

    if titulo_app is not None:
        titulo_app.color = ft.Colors.WHITE if modo_escuro else ft.Colors.BLACK

    if contador_tarefas is not None:
        contador_tarefas.color = ft.Colors.GREY_300 if modo_escuro else ft.Colors.GREY_700

    if badge_mobile is not None:
        badge_mobile.bgcolor = ft.Colors.BLUE_900 if modo_escuro else ft.Colors.BLUE_50
        badge_mobile.content.color = ft.Colors.BLUE_200 if modo_escuro else ft.Colors.BLUE_500

    if switch_tema is not None:
        switch_tema.value = modo_escuro

    if input_tarefa is not None:
        input_tarefa.bgcolor = ft.Colors.GREY_900 if modo_escuro else ft.Colors.WHITE
        input_tarefa.color = ft.Colors.WHITE if modo_escuro else ft.Colors.BLACK
        input_tarefa.border_color = ft.Colors.GREY_600 if modo_escuro else ft.Colors.GREY_400
        input_tarefa.focused_border_color = ft.Colors.BLUE_400 if modo_escuro else ft.Colors.BLUE_500

    if input_edicao is not None:
        input_edicao.bgcolor = ft.Colors.GREY_900 if modo_escuro else ft.Colors.WHITE
        input_edicao.color = ft.Colors.WHITE if modo_escuro else ft.Colors.BLACK
        input_edicao.border_color = ft.Colors.GREY_600 if modo_escuro else ft.Colors.GREY_400
        input_edicao.focused_border_color = ft.Colors.BLUE_400 if modo_escuro else ft.Colors.BLUE_500

    if page_ref is not None:
        page_ref.bgcolor = ft.Colors.GREY_900 if modo_escuro else ft.Colors.GREY_100


def ajustar_layout_por_tamanho(page_obj):
    if page_obj.width is None:
        return

    largura = float(page_obj.width)
    if largura < 360:
        if app_container is not None:
            app_container.width = 320
        if input_tarefa is not None:
            input_tarefa.width = 180
        if input_edicao is not None:
            input_edicao.width = 180
    else:
        if app_container is not None:
            app_container.width = 380
        if input_tarefa is not None:
            input_tarefa.width = 280
        if input_edicao is not None:
            input_edicao.width = 280

    page_obj.update()


def main(page: ft.Page):
    global page_ref, input_tarefa, lista_tarefas, mensagem, input_edicao, btn_salvar, btn_cancelar
    global app_container, titulo_app, contador_tarefas, badge_mobile, switch_tema

    page_ref = page
    carregar_tarefas()

    page.title = "Lista de Tarefas"
    page.padding = 16
    page.bgcolor = ft.Colors.GREY_100
    page.theme_mode = ft.ThemeMode.LIGHT
    page.window_width = 420
    page.window_height = 760
    page.horizontal_alignment = ft.CrossAxisAlignment.CENTER
    page.vertical_alignment = ft.MainAxisAlignment.START
    page.scroll = ft.ScrollMode.AUTO
    page.spacing = 0
    page.on_resize = lambda e: ajustar_layout_por_tamanho(page)

    input_tarefa = ft.TextField(
        label="Nova tarefa",
        width=280,
        border_radius=12,
        border_color=ft.Colors.GREY_400,
        focused_border_color=ft.Colors.BLUE_500,
        hint_text="Ex: Fazer compras",
        dense=True,
        expand=True,
    )
    mensagem = ft.Text(value="", color=ft.Colors.BLUE_500, size=13)

    input_edicao = ft.TextField(
        label="Editar tarefa",
        visible=False,
        width=280,
        border_radius=12,
        border_color=ft.Colors.GREY_400,
        focused_border_color=ft.Colors.BLUE_500,
        dense=True,
        expand=True,
    )
    btn_salvar = ft.Button(
        "Salvar",
        icon=ft.Icons.SAVE,
        visible=False,
        on_click=salvar_edicao,
        style=ft.ButtonStyle(
            shape=ft.RoundedRectangleBorder(radius=12),
            bgcolor=ft.Colors.BLUE_500,
            color=ft.Colors.WHITE,
            padding=ft.Padding(14, 10, 14, 10),
        ),
    )
    btn_cancelar = ft.TextButton("Cancelar", icon=ft.Icons.CANCEL, visible=False, on_click=lambda e: limpar_edicao())

    lista_tarefas = ft.Column(spacing=0)

    filtro_row = ft.Row(
        [
            gerar_botao_filtro("Todas", "todos"),
            gerar_botao_filtro("Pendentes", "pendentes"),
            gerar_botao_filtro("Concluídas", "concluidas"),
        ],
        spacing=8,
        wrap=True,
    )

    titulo_app = ft.Text("Lista de Tarefas", size=28, weight=ft.FontWeight.BOLD)
    contador_tarefas = ft.Text(
        f"{len(tarefas)} tarefas no total",
        size=12,
        color=ft.Colors.GREY_700,
    )
    badge_mobile = ft.Container(
        content=ft.Text("Mobile", size=11, weight=ft.FontWeight.BOLD, color=ft.Colors.BLUE_500),
        padding=ft.Padding(8, 6, 8, 6),
        bgcolor=ft.Colors.BLUE_50,
        border_radius=10,
    )
    switch_tema = ft.Switch(
        value=False,
        on_change=lambda e: alternar_tema(e.control.value),
    )

    content = ft.Column(
        [
            ft.Container(
                content=ft.Row(
                    [
                        ft.Column(
                            [
                                titulo_app,
                                contador_tarefas,
                            ],
                            spacing=2,
                            expand=True,
                        ),
                        ft.Row(
                            [
                                badge_mobile,
                                switch_tema,
                            ],
                            spacing=6,
                            vertical_alignment=ft.CrossAxisAlignment.CENTER,
                        ),
                    ],
                    alignment=ft.MainAxisAlignment.SPACE_BETWEEN,
                    vertical_alignment=ft.CrossAxisAlignment.CENTER,
                ),
                padding=ft.Padding(0, 0, 0, 4),
            ),
            ft.Row(
                [
                    input_tarefa,
                    ft.Button(
                        "Adicionar",
                        icon=ft.Icons.ADD,
                        on_click=adicionar_tarefa,
                        style=ft.ButtonStyle(
                            shape=ft.RoundedRectangleBorder(radius=12),
                            bgcolor=ft.Colors.GREEN_600,
                            color=ft.Colors.WHITE,
                            padding=ft.Padding(16, 14, 16, 14),
                        ),
                    ),
                ],
                alignment=ft.MainAxisAlignment.START,
                vertical_alignment=ft.CrossAxisAlignment.END,
                spacing=8,
            ),
            ft.Row(
                [
                    input_edicao,
                    btn_salvar,
                    btn_cancelar,
                ],
                alignment=ft.MainAxisAlignment.START,
                vertical_alignment=ft.CrossAxisAlignment.END,
                spacing=8,
            ),
            filtro_row,
            mensagem,
            ft.Divider(color=ft.Colors.GREY_300),
            ft.Container(
                content=lista_tarefas,
                padding=ft.Padding(0, 6, 0, 0),
            ),
        ],
        spacing=14,
    )

    app_container = ft.Container(
        content=content,
        width=380,
        padding=18,
        border_radius=24,
        bgcolor=ft.Colors.WHITE,
        border=ft.Border.all(1, ft.Colors.GREY_200),
        shadow=ft.BoxShadow(
            spread_radius=0,
            blur_radius=14,
            color=ft.Colors.BLACK_12,
            offset=ft.Offset(0, 8),
        ),
    )

    page.add(app_container)
    atualizar_visual_tema()
    ajustar_layout_por_tamanho(page)

    atualizar_lista()


ft.app(target=main)
