class WebSocketService {
    constructor() {
      this.socket = null;
      this.isConnected = false;
    }
  
    connect(url) {
      this.socket = new WebSocket(url);
  
      this.socket.onopen = () => {
        console.log('Connected to WebSocket server');
        this.isConnected = true;
      };
  
      this.socket.onclose = (event) => {
        console.log('Disconnected from WebSocket server');
        this.isConnected = false;
      };
  
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.close();
      }
      this.isConnected = false;
    }
  
    send(message) {
      if (this.socket && this.isConnected) {
        this.socket.send(JSON.stringify(message));
      } else {
        console.error('Cannot send message: not connected or socket does not exist');
      }
    }
  
    onMessage(callback) {
      if (this.socket) {
        this.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          callback(data);
        };
      } else {
        console.warn('WebSocket connection not established yet');
      }
    }
  
    isConnected() {
      return this.isConnected;
    }
  }
  
  export default new WebSocketService();