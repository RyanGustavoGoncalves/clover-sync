# Clover Sync

Sincronize e gerencie scripts entre o Visual Studio Code e a aplicação Clover com facilidade. **Clover Sync** permite que desenvolvedores sincronizem scripts diretamente no VS Code, editem arquivos, adicionem mensagens de commit e sincronizem automaticamente as mudanças com o frontend. Ideal para equipes que precisam manter scripts em sincronia em tempo real, proporcionando uma experiência de edição rápida e integrada.

## Features

- **Sincronização em Tempo Real**: Envie scripts da aplicação Clover para o VS Code e sincronize as alterações automaticamente após a edição.
- **Controle de Versionamento com Commits**: Adicione mensagens de commit a cada alteração, garantindo um histórico de mudanças para cada arquivo.
- **Estrutura de Pastas Organizada**: Os arquivos são armazenados em uma estrutura hierárquica específica para cada projeto sincronizado, com metadados para fácil navegação.
- **Notificações e Logs**: Receba notificações e logs detalhados para acompanhar cada sincronização e commit realizados.

![Sincronização em Tempo Real](./assets/cloverSync.png)

## Requirements

Clover Sync requer o **Visual Studio Code 1.95.0** ou superior. Certifique-se também de que a aplicação Clover esteja configurada para interagir com o VS Code.

## Extension Settings

Esta extensão adiciona a seguinte configuração:

- **`clover-sync.runScript`**: Executa a sincronização do Clover Sync diretamente no VS Code.

## Known Issues

- **Erro de sincronização em arquivos não salvos**: Certifique-se de que os arquivos estejam salvos antes de realizar a sincronização.
- **Limitações de versões antigas**: Funcionalidades completas podem não estar disponíveis em versões do VS Code abaixo de 1.95.0.

## Release Notes

### 0.0.3

- **Sincronização Básica**: Primeira versão com suporte à sincronização de arquivos, estrutura de pastas organizada e controle de versões com mensagens de commit.
