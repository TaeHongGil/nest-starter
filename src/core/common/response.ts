export class CommonResponse {
  timestamp: Date;
  data?: any;
  error?: Error;

  constructor(builder: CommonResponseBuilder) {
    this.timestamp = builder.timestamp;
    this.data = builder.data;
    this.error = builder.error;
  }

  static builder(): CommonResponseBuilder {
    return new CommonResponseBuilder();
  }
}

export class CommonResponseBuilder {
  timestamp: Date;
  data?: any;
  error?: any;

  constructor() {
    this.timestamp = new Date();
  }

  setData(data: any): this {
    this.data = data;

    return this;
  }

  setError(error: Error): this {
    this.error = {};
    this.error['message'] = error.message;

    return this;
  }

  setTimestamp(timestamp: Date): this {
    this.timestamp = timestamp;

    return this;
  }

  build(): CommonResponse {
    return new CommonResponse(this);
  }
}
