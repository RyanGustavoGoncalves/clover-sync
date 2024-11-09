import * as vscode from 'vscode';
import { StatusBarService } from '../service/StatusBarService';

export class StatusBar {
    private statusBarItem: vscode.StatusBarItem;
    public isActive: boolean = false;
    public terminal: vscode.Terminal | undefined;
    private service: StatusBarService;

    constructor(context: vscode.ExtensionContext) {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'clover-sync.runScript';
        this.service = new StatusBarService();
        this.updateStatusBar();
        this.statusBarItem.show();

        context.subscriptions.push(this.statusBarItem);
    }

    public updateStatusBar(): void {
        this.service.updateStatusBar(this.isActive, this.statusBarItem);
    }

    public runScript(): void {
        this.service.runScript(this);
        this.updateStatusBar();
    }

    public dispose(): void {
        this.statusBarItem.dispose();
        if (this.terminal) {
            this.terminal.dispose();
        }
    }
}
