import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	let myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	myStatusBarItem.text = `$(rocket) Clover Sync - Ativar`;
	myStatusBarItem.tooltip = 'Clique para sincronizar o projeto';
	myStatusBarItem.command = 'clover-sync.runScript';
	myStatusBarItem.show();

	// Adiciona o item às assinaturas do contexto para que ele seja limpo quando a extensão é desativada
	context.subscriptions.push(myStatusBarItem);

	// Registra o comando associado ao item da Status Bar
	let disposable = vscode.commands.registerCommand('clover-sync.runScript', () => {
		// Código que será executado quando o item da Status Bar for clicado
		vscode.window.showInformationMessage('Sincronizando!');
		let terminal = vscode.window.createTerminal('clover-sync');
		terminal.show();
		terminal.sendText('echo "Olá, Mundo!"');
	});

	context.subscriptions.push(disposable);
}

// Método chamado quando sua extensão é desativada
export function deactivate() { }
