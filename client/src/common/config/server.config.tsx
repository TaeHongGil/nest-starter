class ServerConfig {
  static url: string;
  static server_name: string;
  static zone: string;
  static build_type: string;
  static server_http_port: string;
  static server_socket_port: string;
  static server_base_url: string;

  static {
    this.server_name = import.meta.env.VITE_SERVER_NAME;
    this.zone = import.meta.env.VITE_ZONE;
    this.build_type = import.meta.env.VITE_BUILD_TYPE;
    this.server_http_port = import.meta.env.VITE_SERVER_HTTP_PORT;
    this.server_socket_port = import.meta.env.VITE_SERVER_SOCKET_PORT;
    this.server_base_url = `${window.location.protocol}//${window.location.hostname}:${this.server_http_port}`;
    this.url = this.getURL(this.server_http_port);
  }

  static getURL(port?: string): string {
    const host = window.location.hostname;

    return `${window.location.protocol}//${host}:${port ?? window.location.port}`;
  }
}

export default ServerConfig;
