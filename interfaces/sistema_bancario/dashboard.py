# Tela principal com operações

import customtkinter as ctk
from usuarios import usuarios
import operacoes
import extrato

def abrir_dashboard(cpf):
    Janela = ctk.CTk()
    Janela.geometry("320x550")
    Janela.title("Senta que é Banco")

    usuario = usuarios[cpf]

    saldo_label = ctk.CTkLabel(Janela, text=f"Saldo: R$ {usuario['saldo']:.2f}", font=("Arial", 16))
    saldo_label.pack(pady=10)

    def atualizar():
        saldo_label.configure(text=f"Saldo: R$ {usuario['saldo']:.2f}")

    ctk.CTkButton(Janela, text="Ver Extrato", command=lambda: extrato.ver_extrato(usuario)).pack(pady=5)
    ctk.CTkButton(Janela, text="Depositar", command=lambda: operacoes.abrir_operacao(Janela, usuario, "Depósito", atualizar)).pack(pady=5)
    ctk.CTkButton(Janela, text="Sacar", command=lambda: operacoes.abrir_operacao(Janela, usuario, "Saque", atualizar)).pack(pady=5)
    ctk.CTkButton(Janela, text="Transferir", command=lambda: operacoes.abrir_transferencia(Janela, usuario, atualizar)).pack(pady=5)
    ctk.CTkButton(Janela, text="Sair", command=Janela.destroy).pack(pady=20)

    Janela.mainloop()