# Funções de depósito, saque, transferência

import customtkinter as ctk
from usuarios import usuarios

def abrir_operacao(root, usuario, tipo, atualizar_saldo):
    janela = ctk.CTkToplevel(root)
    janela.geometry("280x200")
    janela.title(tipo)

    ctk.CTkLabel(janela, text=f"Valor para {tipo.lower()}:").pack(pady=10)
    entrada = ctk.CTkEntry(janela, placeholder_text="R$ 0.00")
    entrada.pack(pady=10)

    def confirmar():
        try:
            valor = float(entrada.get())
            if valor <= 0:
                raise ValueError

            if tipo == "Depósito":
                usuario["saldo"] += valor
                usuario["extrato"].append(f"Depósito de R$ {valor:.2f}")
            elif tipo == "Saque":
                if usuario["saldo"] >= valor:
                    usuario["saldo"] -= valor
                    usuario["extrato"].append(f"Saque de R$ {valor:.2f}")
                else:
                    ctk.CTkMessagebox(title="Erro", message="Saldo insuficiente.")
                    return
            atualizar_saldo()
            janela.destroy()
        except:
            ctk.CTkMessagebox(title="Erro", message="Valor inválido.")

    ctk.CTkButton(janela, text="Confirmar", command=confirmar).pack(pady=10)

def abrir_transferencia(root, usuario, atualizar_saldo):
    janela = ctk.CTkToplevel(root)
    janela.geometry("300x250")
    janela.title("Transferência")

    ctk.CTkLabel(janela, text="CPF do destinatário:").pack(pady=5)
    cpf_entry = ctk.CTkEntry(janela)
    cpf_entry.pack(pady=5)

    ctk.CTkLabel(janela, text="Valor:").pack(pady=5)
    valor_entry = ctk.CTkEntry(janela)
    valor_entry.pack(pady=5)

    def confirmar():
        try:
            valor = float(valor_entry.get())
            destino = cpf_entry.get()
            if destino not in usuarios:
                ctk.CTkMessagebox(title="Erro", message="Destinatário não encontrado.")
                return
            if valor <= 0 or usuario["saldo"] < valor:
                ctk.CTkMessagebox(title="Erro", message="Valor inválido ou saldo insuficiente.")
                return

            usuario["saldo"] -= valor
            usuario["extrato"].append(f"Transferência de R$ {valor:.2f} para {destino}")
            usuarios[destino]["saldo"] += valor
            usuarios[destino]["extrato"].append(f"Recebido R$ {valor:.2f} de {usuario['nome']}")
            atualizar_saldo()
            janela.destroy()
        except:
            ctk.CTkMessagebox(title="Erro", message="Valor inválido.")

    ctk.CTkButton(janela, text="Confirmar", command=confirmar).pack(pady=10)