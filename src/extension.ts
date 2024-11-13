// extension.ts
import * as vscode from 'vscode';
import { StatusBar } from './controller/StatusBar';

export function activate(context: vscode.ExtensionContext): void {
	const statusBar = new StatusBar(context);

	const disposable = vscode.commands.registerCommand('clover-sync.runScript', () => {
		statusBar.runScript();
	});

	context.subscriptions.push(disposable);
}

export function deactivate(): void {
	// Limpeza de recursos, se necessário
}
