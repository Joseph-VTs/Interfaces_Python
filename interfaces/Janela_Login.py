import customtkinter as ctk

# Configurações de Aparência
ctk.set_appearance_mode('dark')


# Criação das Funções de Funcionalidade
def Validar_Login():
    Usuario = Input_Usuario.get()
    Senha = Input_Senha.get()
    
    # Verificação de Usuario e Senha
    db_Usuario = "Elizeu"
    db_Senha = "123456"
    
    if Usuario == db_Usuario and Senha == db_Senha:
        Resultado_Login.configure(text='Login Feito com Sucesso!', text_color='green')
    else:
        Resultado_Login.configure(text='Login Incorreto!', text_color='red')

# Criação da Janela Principal
Janela = ctk.CTk()
Janela.title('Sistema de Login')
Janela.geometry('300x400') # Largura x Altura


# Criação dos Campos
Label_Usuario = ctk.CTkLabel(Janela, text='Usuário')
Label_Usuario.pack(pady=0)

Input_Usuario = ctk.CTkEntry(Janela, placeholder_text='Digite seu Usuário...')
Input_Usuario.pack(pady=6)


Label_Senha = ctk.CTkLabel(Janela, text='Senha')
Label_Senha.pack(pady=0)

Input_Senha = ctk.CTkEntry(Janela, placeholder_text='Digite sua Senha...', show='*')
Input_Senha.pack(pady=6)


Botao_Login = ctk.CTkButton(Janela, text='Entrar', command=Validar_Login)
Botao_Login.pack(pady=0)

# Campo Feedback de Login
Resultado_Login = ctk.CTkLabel(Janela, text='')
Resultado_Login.pack(pady=0)




# Iniciar a Aplicação
Janela.mainloop()