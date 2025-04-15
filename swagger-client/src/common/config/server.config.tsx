class ServerConfig {
  static url: string;
  static server_type: string;
  static server_port: string;
  static server_version: string;

  static init(): boolean {
    this.server_type = import.meta.env.VITE_SERVER_TYPE;
    this.server_port = import.meta.env.VITE_SERVER_PORT;
    this.server_version = 'v' + import.meta.env.VITE_SERVER_VERSION;
    this.url = this.getURL(this.server_port);

    return true;
  }

  static getURL(port?: string): string {
    let host = window.location.hostname;
    return `${window.location.protocol}//${host}:${port ?? window.location.port}`;
  }
}

export default ServerConfig;
