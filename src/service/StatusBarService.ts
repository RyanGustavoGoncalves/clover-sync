import * as vscode from 'vscode';
import { StatusBar } from '../controller/StatusBar';
import { Command } from './Command';

export class StatusBarService {
    private command = new Command();
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
            this.command.runScript(statusBar);
            statusBar.isActive = false;
            vscode.window.showInformationMessage('Sincronização parada!');
            if (statusBar.terminal) {
                statusBar.terminal.dispose();
                statusBar.terminal = undefined;
            }
        } else {
            statusBar.isActive = true;
            vscode.window.showInformationMessage('Sincronização iniciada!');
            statusBar.terminal = vscode.window.createTerminal('clover-sync');
            statusBar.terminal.show();
            this.command.runScript(statusBar);
            statusBar.terminal.sendText('echo "Sincronização iniciada!"');
        }
    }
}
