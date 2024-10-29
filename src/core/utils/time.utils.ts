import moment from 'moment';

export class TimeUtil {
  /**
   * msec를 시:분:초 형식의 문자열로 변환하는 메서드
   * @param sec 초 단위의 시간
   * @returns 시:분:초 형식의 문자열 (예: 01:01:01)
   */
  static msecToString(msec: number): string {
    return moment.utc(msec).format('HH:mm:ss');
  }
}

export default TimeUtil;
