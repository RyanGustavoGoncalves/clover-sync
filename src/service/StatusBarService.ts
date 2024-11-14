// StatusBarService.ts
import * as vscode from 'vscode';
import { StatusBar } from '../controller/StatusBar';
import { Command } from './Command';

export class StatusBarService {
    private command: Command;

    constructor(context: vscode.ExtensionContext) {
        this.command = new Command(context);
    }

    public updateStatusBar(isActive: boolean, statusBarItem: vscode.StatusBarItem): void {
        if (isActive) {
            statusBarItem.text = `$(sync~spin) Clover Sync - Ativo`;
            statusBarItem.tooltip = 'Clique para parar a sincronização';
        } else {
            statusBarItem.text = `$(rocket) Clover Sync - Inativo`;
            statusBarItem.tooltip = 'Clique para iniciar a sincronização';
        }
    }

    public runScript(statusBar: StatusBar): void {
        if (statusBar.isActive) {
            // Parar a sincronização
            statusBar.isActive = false;
            vscode.window.showInformationMessage('Sincronização parada!');
        } else {
            // Iniciar a sincronização
            statusBar.isActive = true;
            this.command.initializeWebSocketServer();
            this.command.registerEvents();
            vscode.window.showInformationMessage('Sincronização iniciada!');
        }

        // Atualizar a barra de status
        this.updateStatusBar(statusBar.isActive, statusBar.statusBarItem);
    }

    public dispose() {
        this.command.dispose();
    }
}
