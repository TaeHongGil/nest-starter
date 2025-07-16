import { ClassConstructor, instanceToPlain, plainToInstance } from 'class-transformer';

export class BeanUtils {
  static ToInsArray<T, V>(cls: ClassConstructor<T>, plain: V[] | V): T[] {
    const result = [];
    if (Array.isArray(plain)) {
      for (const data of plain) {
        const ins = this.ToIns(cls, data);
        result.push(ins);
      }
    } else {
      const values: any = plain;
      for (const k in values) {
        let data: any = plain[k];
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        const ins = this.ToIns(cls, data);
        result.push(ins);
      }
    }

    return result;
  }

  static ToIns<T, V>(cls: ClassConstructor<T>, plain: V): T {
    const ins = plainToInstance(cls, plain, { excludeExtraneousValues: true });

    return ins;
  }

  static ToPlainArray<T>(object: T[]): Record<string, any>[] {
    const result = [];
    for (const data of object) {
      const ins = instanceToPlain(data);
      result.push(ins);
    }

    return result;
  }

  static ToPlain<T>(object: T): Record<string, any> {
    const ins = instanceToPlain(object);

    return ins;
  }
}
