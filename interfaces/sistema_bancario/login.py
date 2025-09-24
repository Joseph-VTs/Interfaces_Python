# Tela de login e validação

import customtkinter as ctk
from usuarios import usuarios, usuario_logado
import dashboard

def iniciar_login():
    Janela = ctk.CTk()
    Janela.geometry("320x550")
    Janela.title("Login Bancário")

    ctk.CTkLabel(Janela, text="Bem-vindo!", font=("Arial", 20)).pack(pady=20)
    usuario_entry = ctk.CTkEntry(Janela, placeholder_text="CPF")
    usuario_entry.pack(pady=10)
    senha_entry = ctk.CTkEntry(Janela, placeholder_text="Senha", show="*")
    senha_entry.pack(pady=10)

    def entrar():
        cpf = usuario_entry.get()
        senha = senha_entry.get()
        if cpf in usuarios and usuarios[cpf]["senha"] == senha:
            dashboard.abrir_dashboard(cpf)
            Janela.destroy()
        else:
            ctk.CTkMessagebox(title="Erro", message="CPF ou senha inválidos.")

    ctk.CTkButton(Janela, text="Entrar", command=entrar).pack(pady=20)
    Janela.mainloop()