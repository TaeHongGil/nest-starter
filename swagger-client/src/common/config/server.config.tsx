class ServerConfig {
  static url: string;
  static server_name: string;
  static server_type: string;
  static server_http_port: string;
  static server_socket_port: string;
  static server_version: string;

  static init(): boolean {
    this.server_name = import.meta.env.VITE_SERVER_NAME;
    this.server_type = import.meta.env.VITE_SERVER_TYPE;
    this.server_http_port = import.meta.env.VITE_SERVER_HTTP_PORT;
    this.server_socket_port = import.meta.env.VITE_SERVER_SOCKET_PORT;
    this.server_version = 'v' + import.meta.env.VITE_SERVER_VERSION;
    this.url = this.getURL(this.server_http_port);

    return true;
  }

  static getURL(port?: string): string {
    const host = window.location.hostname;

    return `${window.location.protocol}//${host}:${port ?? window.location.port}`;
  }
}

export default ServerConfig;
