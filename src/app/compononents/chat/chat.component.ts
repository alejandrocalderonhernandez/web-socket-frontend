import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { Message } from '../../models/message';
import * as SockJS from 'sockjs-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  private client: Client;

  conected = false;
  messageModel: Message;
  messages: Message[];
  write: string;
  id: string;

  constructor() {
    this.client = new Client();
    this.messageModel = new Message();
    this.messages = [];
    this.id = 'id-' + new Date().getUTCMilliseconds();
  }

  ngOnInit() {
    this.clientConfig();
  }

  clientConfig(): void {
    this.client.webSocketFactory = () => {
      return new SockJS('http://localhost:8080/chat');
    };
    this.client.onConnect = ( frame ) => {
      console.log( 'connected -> ' + this.client.connected + ' : ' + frame );
      this.conected = true;
      this.getMessageByBroker();
      this.getWriting();
      this.getNewUser();
      this.getHistory();
    };

    this.client.onDisconnect = ( frame ) => {
      this.conected = false;
      this.messageModel = new Message();
      this.messages = [];
    };
  }

  getMessageByBroker(): void {
    this.client.subscribe('/send/message', responce => {
      const message = JSON.parse(responce.body) as Message;
      this.messages.push(message);
      if ( !this.messageModel.color
        && message.type === 'NEW_USER'
        && this.messageModel.username === message.username ) {
          this.messageModel.color = message.color;
      }
    });
  }

  getWriting(): void {
    this.client.subscribe('/send/writing', responce => {
      this.write = responce.body;
      setTimeout(() => {
        this.write = '';
      }, 4000);
    });
  }

  getNewUser(): void {
    this.messageModel.type = 'NEW_USER';
    this.client.publish({
      destination: '/app/message',
      body: JSON.stringify(this.messageModel)
    });
  }

  getHistory(): void {
    this.client.subscribe( '/send/hystory/' + this.id, responce => {
      const history = JSON.parse(responce.body) as Message[];
      this.messages = history.map( m => {
        m.date = new Date(m.date);
        return m;
      }).reverse();
    });
    this.client.publish({
      destination: '/app/history',
      body: this.id
    });
  }

  connect(): void {
    this.client.activate();
  }

  desconnect(): void {
    this.client.deactivate();
  }

  sendMessage(): void {
    this.messageModel.type = 'MESSAGE';
    this.client.publish({
                          destination: '/app/message',
                          body: JSON.stringify(this.messageModel)
                        });
    this.messageModel.text = '';
  }

  writing(): void {
    this.client.publish({
      destination: '/app/writing',
      body: JSON.stringify(this.messageModel.username)
    });
  }
}
