import * as vscode from 'vscode';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { StatusBar } from '../controller/StatusBar';

export class Command {
    private stompClient: Client | undefined;

    public runScript(statusBar: StatusBar): void {
        if (this.stompClient && this.stompClient.active) {
            // Desconectar
            this.stompClient.deactivate();
            this.stompClient = undefined;
            vscode.window.showInformationMessage('Conexão STOMP encerrada.');
        } else {
            // Conectar
            statusBar.isActive = true;

            const socketUrl = 'http://localhost:8080/ws';
            const socket = new SockJS(socketUrl);

            this.stompClient = new Client({
                webSocketFactory: () => socket as any,
                debug: (str) => {
                    console.log(str);
                },
                onConnect: () => {
                    vscode.window.showInformationMessage('Conexão STOMP estabelecida.');

                    // Inscrever-se em um tópico
                    this.stompClient!.subscribe('/topic/respostas', (message: IMessage) => {
                        const mensagem = message.body;
                        vscode.window.showInformationMessage(`Mensagem recebida: ${mensagem}`);
                    });

                    // Enviar uma mensagem
                    const msg = { nome: 'SeuNome' };
                    this.stompClient!.publish({ destination: '/app/mensagem', body: JSON.stringify(msg) });
                },
                onStompError: (frame) => {
                    vscode.window.showErrorMessage(`Erro STOMP: ${frame.headers['message']}`);
                },
            });

            this.stompClient.activate();
        }
    }
}
