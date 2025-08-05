export class MongoFieldSchema {
  name: string;
  type: string;
  required: boolean;
}

export class MongoCollectionSchema {
  name: string;
  properties: MongoFieldSchema[];
}
