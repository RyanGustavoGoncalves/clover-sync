// Command.ts
import * as vscode from 'vscode';
import WebSocket, { WebSocketServer } from 'ws';
import * as fs from 'fs';
import * as path from 'path';

export class Command {
    private wss: WebSocketServer | null = null;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public initializeWebSocketServer() {
        this.wss = new WebSocketServer({ port: 8090 });
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('Frontend conectado ao servidor WebSocket');

            ws.on('message', (message: string) => {
                console.log('Mensagem recebida do frontend:', message);
                const data = JSON.parse(message);
                if (data.type === 'syncFile') {
                    this.handleSyncFile(data.payload, ws);
                }
            });

            ws.on('close', () => {
                console.log('Conexão WebSocket fechada');
            });

            ws.on('error', (error) => {
                console.error('Erro no WebSocket:', error);
            });
        });

        console.log('Servidor WebSocket iniciado em ws://localhost:8080');
    }

    private async handleSyncFile(payload: any, ws: WebSocket) {
        const { idProject, projectName, idFile, fileContent, fileName, commitMessage } = payload;

        if (!idProject || !projectName || !idFile || !fileContent || !fileName) {
            ws.send(JSON.stringify({ type: 'error', message: 'Payload incompleto.' }));
            return;
        }

        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                ws.send(JSON.stringify({ type: 'error', message: 'Nenhum workspace aberto no VSCode.' }));
                return;
            }
            const workspacePath = workspaceFolders[0].uri.fsPath;

            const cloverPath = path.join(workspacePath, 'Clover');

            await fs.promises.mkdir(cloverPath, { recursive: true });

            const projectPath = path.join(cloverPath, projectName);

            await fs.promises.mkdir(projectPath, { recursive: true });

            const projectJsonPath = path.join(cloverPath, 'project.json');

            if (!fs.existsSync(projectJsonPath)) {
                const projectData = {
                    projects: [
                        {
                            id: idProject,
                            name: projectName
                        }
                    ]
                };
                await fs.promises.writeFile(projectJsonPath, JSON.stringify(projectData, null, 2), 'utf-8');
            } else {
                const projectJsonData = JSON.parse(await fs.promises.readFile(projectJsonPath, 'utf-8'));
                const projectExists = projectJsonData.projects.some((proj: any) => proj.id === idProject);
                if (!projectExists) {
                    projectJsonData.projects.push({ id: idProject, name: projectName });
                    await fs.promises.writeFile(projectJsonPath, JSON.stringify(projectJsonData, null, 2), 'utf-8');
                }
            }

            const filePath = path.join(projectPath, fileName);

            await fs.promises.writeFile(filePath, fileContent, 'utf-8');

            const dataFilesPath = path.join(projectPath, 'dataFiles.json');

            let dataFiles = [];
            if (fs.existsSync(dataFilesPath)) {
                const data = await fs.promises.readFile(dataFilesPath, 'utf-8');
                dataFiles = JSON.parse(data);
            }

            const fileIndex = dataFiles.findIndex((file: any) => file.id === idFile);
            const syncedAt = new Date().toISOString();
            const fileData = {
                id: idFile,
                name: fileName,
                syncedAt: syncedAt,
                commitMessage: commitMessage || 'Sem mensagem de commit.'
            };

            if (fileIndex !== -1) {
                dataFiles[fileIndex] = fileData;
            } else {
                dataFiles.push(fileData);
            }

            await fs.promises.writeFile(dataFilesPath, JSON.stringify(dataFiles, null, 2), 'utf-8');

            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document, { preview: false });

            ws.send(JSON.stringify({ type: 'success', message: 'Arquivo sincronizado e aberto no VSCode.' }));
        } catch (error) {
            console.error('Erro ao sincronizar arquivo:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Erro ao sincronizar o arquivo.' }));
        }
    }

    public registerEvents() {
        vscode.workspace.onWillSaveTextDocument(async (event: vscode.TextDocumentWillSaveEvent) => {
            await this.handleWillSaveDocument(event);
        });
    }

    private async handleWillSaveDocument(event: vscode.TextDocumentWillSaveEvent) {
        if (this.wss && this.wss.clients.size > 0) {
            try {
                const fileContent = event.document.getText();
                const filePath = event.document.uri.fsPath;
                const relativePath = vscode.workspace.asRelativePath(filePath);

                const cloverPath = path.join(vscode.workspace.workspaceFolders![0].uri.fsPath, 'Clover');
                const projectJsonPath = path.join(cloverPath, 'project.json');

                if (!fs.existsSync(projectJsonPath)) {
                    console.warn('project.json não encontrado. Ignorando envio.');
                    return;
                }

                const projectJsonData = JSON.parse(await fs.promises.readFile(projectJsonPath, 'utf-8'));
                const project = projectJsonData.projects.find((proj: any) => {
                    const projectFolder = path.join(cloverPath, proj.name);
                    return filePath.startsWith(projectFolder);
                });

                if (!project) {
                    console.warn('Projeto correspondente não encontrado para o arquivo salvo.');
                    return;
                }

                const fileName = path.basename(filePath);
                const dataFilesPath = path.join(path.dirname(filePath), 'dataFiles.json');

                if (!fs.existsSync(dataFilesPath)) {
                    console.warn('dataFiles.json não encontrado. Ignorando envio.');
                    return;
                }

                const dataFilesData = JSON.parse(await fs.promises.readFile(dataFilesPath, 'utf-8'));
                const fileMetaData = dataFilesData.find((file: any) => file.name === fileName);

                if (!fileMetaData) {
                    console.warn('Arquivo não listado em dataFiles.json. Ignorando envio.');
                    return;
                }

                const commitMessage = await vscode.window.showInputBox({
                    prompt: 'Digite uma mensagem para o commit',
                    placeHolder: 'Mensagem de commit',
                    validateInput: (text) => text.trim().length > 0 ? null : 'A mensagem de commit não pode estar vazia.'
                });

                if (!commitMessage) {
                    vscode.window.showWarningMessage('Commit cancelado. É necessário uma mensagem de commit para salvar.');
                    event.waitUntil(new Promise<void>((resolve) => {
                        resolve();
                    }));
                    return;
                }

                const message = JSON.stringify({
                    type: 'fileSaved',
                    payload: {
                        projectId: project.id,
                        projectName: project.name,
                        fileId: fileMetaData.id,
                        filePath: relativePath,
                        fileContent: fileContent,
                        commitMessage: commitMessage
                    }
                });

                this.wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(message);
                    }
                });

                console.log(`Enviado conteúdo atualizado do arquivo: ${relativePath} para o frontend com mensagem de commit: "${commitMessage}"`);
            } catch (error) {
                console.error('Erro ao processar salvamento de documento:', error);
            }
        }
    }

    public dispose() {
        if (this.wss) {
            this.wss.close();
        }
    }
}