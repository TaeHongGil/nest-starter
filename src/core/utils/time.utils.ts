import moment from 'moment';

export class TimeUtil {
  /**
   * 초를 시:분:초 형식의 문자열로 변환하는 메서드
   * @param sec 초 단위의 시간
   * @returns 시:분:초 형식의 문자열 (예: 01:01:01)
   */
  static secToString(sec: number): string {
    return moment.utc(sec * 1000).format('HH:mm:ss');
  }
}

export default TimeUtil;
