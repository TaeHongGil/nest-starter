class ServerConfig {
  static server_name: string;
  static zone: string;
  static build_type: string;
  static api_url: string;
  static batch_url: string;
  static socket_url: string;
  static mq_url: string;
  static server_api_port: string;
  static server_batch_port: string;
  static server_socket_port: string;
  static server_mq_port: string;

  static {
    this.server_name = import.meta.env.VITE_SERVER_NAME;
    this.zone = import.meta.env.VITE_ZONE;
    this.build_type = import.meta.env.VITE_BUILD_TYPE;
    this.server_api_port = import.meta.env.VITE_SERVER_API_PORT;
    this.server_batch_port = import.meta.env.VITE_SERVER_BATCH_PORT;
    this.server_socket_port = import.meta.env.VITE_SERVER_SOCKET_PORT;
    this.server_mq_port = import.meta.env.VITE_SERVER_MQ_PORT;
    this.api_url = this.getURL(window.location.hostname, this.server_api_port);
    this.batch_url = this.getURL(window.location.hostname, this.server_batch_port);
    this.socket_url = this.getURL(window.location.hostname, this.server_socket_port);
    this.mq_url = this.getURL(window.location.hostname, this.server_mq_port);
  }

  static getURL(host?: string, port?: string): string {
    const hostname = host ? host : window.location.hostname;

    return `${window.location.protocol}//${hostname}:${port ?? window.location.port}`;
  }
}

export default ServerConfig;
