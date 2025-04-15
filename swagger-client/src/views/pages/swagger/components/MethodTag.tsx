import { METHOD_TYPE } from '@root/common/define/common.define';

interface Props {
  method: METHOD_TYPE;
  sm?: boolean;
}

export const MethodTag = (props: Props) => <span className={`method-tag ${props.method} ${props.sm ? 'small' : ''}`}>{props.sm ? props.method.slice(0, 1) : props.method}</span>;
