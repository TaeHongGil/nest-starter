import dayjs from 'dayjs';

export class CommonResponse {
  timestamp: string;
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
  timestamp: string;
  data?: any;
  error?: any;

  constructor() {
    this.timestamp = dayjs.tz().format();
  }

  setData(data: any): this {
    this.data = data;

    return this;
  }

  setError(error: Error): this {
    this.error = {
      message: error.message,
      statusCode: error['status'] || 500,
    };

    return this;
  }

  setTimestamp(timestamp: string): this {
    this.timestamp = timestamp;

    return this;
  }

  build(): CommonResponse {
    return new CommonResponse(this);
  }
}
