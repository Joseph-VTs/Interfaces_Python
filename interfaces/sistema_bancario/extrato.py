# Tela de extrato com scroll

import customtkinter as ctk
from datetime import datetime

def ver_extrato(usuario):
    janela = ctk.CTkToplevel()
    janela.geometry("300x400")
    janela.title("Extrato")

    ctk.CTkLabel(janela, text="Movimentações", font=("Arial", 16)).pack(pady=10)
    frame = ctk.CTkScrollableFrame(janela, width=280, height=300)
    frame.pack(pady=10)

    if not usuario["extrato"]:
        ctk.CTkLabel(frame, text="Nenhuma movimentação registrada.").pack(pady=10)
    else:
        for item in usuario["extrato"]:
            data = datetime.now().strftime("%d/%m/%Y %H:%M")
            texto = f"{data} - {item}"
            ctk.CTkLabel(frame, text=texto, anchor="w").pack(fill="x", padx=10, pady=5)