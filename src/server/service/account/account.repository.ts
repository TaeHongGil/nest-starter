import { Injectable } from '@nestjs/common';
import { MongoService } from '@root/core/mongo/mongo.service';
import { DBAccount, DBAccountSchema } from './account.schema';

@Injectable()
export class AccountRepository {
  constructor(private readonly mongo: MongoService) {}

  async getAccountAsync(useridx: number): Promise<DBAccount> {
    const con = this.mongo.getGlobalClient();
    const model = con.model(DBAccount.name, DBAccountSchema);
    const resultDoc = await model.findOne({ useridx: useridx }).lean();
    if (!resultDoc) {
      return undefined;
    }
    return resultDoc;
  }

  async deleteAccountAsync(useridx: number): Promise<boolean> {
    const con = this.mongo.getGlobalClient();
    const model = con.model(DBAccount.name, DBAccountSchema);
    const resultDoc = await model.deleteOne({ useridx: useridx }).lean();
    if (!resultDoc) {
      return false;
    }
    return true;
  }

  async upsertAccountAsync(account: DBAccount): Promise<DBAccount> {
    const con = this.mongo.getGlobalClient();
    const model = con.model(DBAccount.name, DBAccountSchema);
    const resultDoc = await model.findOneAndUpdate({ useridx: account.useridx }, account, { new: true, upsert: true }).lean();
    if (!resultDoc) {
      return resultDoc;
    }
    return resultDoc;
  }
}
