import { useState } from "react";
import Calendar from "react-calendar";
import classNames from "classnames/bind";
import styles from "@/styles/Modify.module.scss";
import { getReservationReserved } from "@/lib/apis/reservationUser";

const cn = classNames.bind(styles);
type TimeSlot = string;

type DateTimeSelectorProps = {
  onChange: (data: { visitDate: Date; startTime: Date; endTime: Date }) => void;
};

export default function DateTimeSelector({ onChange }: DateTimeSelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeBlocks, setSelectedTimeBlocks] = useState<TimeSlot[]>([]);
  const [reservedTimes, setReservedTimes] = useState<{ [key: string]: TimeSlot[] }>({});
  const [isLoadingReservedTimes, setIsLoadingReservedTimes] = useState<boolean>(false);

  const getTimes = () => {
    const times: TimeSlot[] = [];
    for (let hour = 10; hour <= 17; hour++) {
      for (const min of [0, 30]) {
        if (!(hour === 17 && min === 30)) {
          times.push(`${hour.toString().padStart(2, "0")}:${min === 0 ? "00" : "30"}`);
        }
      }
    }
    return times;
  };

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isBlockedDate = (date: Date) => formatLocalDate(date) === "2026-05-24";

  const handleDateChange = async (date: Date) => {
    if (isClosedBookingWeek(date)) {
      return;
    }
    setSelectedDate(date);
    setSelectedTimeBlocks([]);
    
    // 날짜를 로컬 시간 기준으로 yyyy-mm-dd 형식으로 변환
    const dateKey = formatLocalDate(date);
    
    // 이미 로드된 예약 시간이 있으면 재사용
    if (reservedTimes[dateKey]) {
      return;
    }
    
    // API 호출하여 예약된 시간 가져오기
    setIsLoadingReservedTimes(true);
    try {
      const response = await getReservationReserved(dateKey);
      
      if (response && response.data) {
        // API 응답 형식에 따라 예약된 시간 배열 추출
        // 응답이 배열인 경우와 객체인 경우 모두 처리
        let reservedTimeSlots: TimeSlot[] = [];
        
        if (Array.isArray(response.data)) {
          reservedTimeSlots = response.data;
        } else if (response.data.times && Array.isArray(response.data.times)) {
          reservedTimeSlots = response.data.times;
        } else if (response.data.reservedTimes && Array.isArray(response.data.reservedTimes)) {
          reservedTimeSlots = response.data.reservedTimes;
        }
        
        // 예약된 시간을 상태에 저장
        setReservedTimes(prev => ({
          ...prev,
          [dateKey]: reservedTimeSlots
        }));
      } else {
        // 응답이 없거나 데이터가 없으면 빈 배열로 설정
        setReservedTimes(prev => ({
          ...prev,
          [dateKey]: []
        }));
      }
    } catch (error) {
      console.error('예약된 시간 조회 실패:', error);
      // 에러 발생 시 빈 배열로 설정
      setReservedTimes(prev => ({
        ...prev,
        [dateKey]: []
      }));
    } finally {
      setIsLoadingReservedTimes(false);
    }
  };

  const handleTimeClick = (time: TimeSlot) => {
    if (!selectedDate) return;
    const dateKey = formatLocalDate(selectedDate);
    const reserved = reservedTimes[dateKey] || [];

    if (reserved.includes(time)) return;

    let newTimeBlocks = [...selectedTimeBlocks];
    
    // 중간 타일인지 확인
    if (newTimeBlocks.length > 1) {
      const allTimes = getTimes();
      const currentIndex = allTimes.indexOf(time);
      const firstIndex = allTimes.indexOf(newTimeBlocks[0]);
      const lastIndex = allTimes.indexOf(newTimeBlocks[newTimeBlocks.length - 1]);
      
      // 시작 시간을 다시 클릭한 경우 - 모든 선택 해제
      if (time === newTimeBlocks[0]) {
        newTimeBlocks = [];
        setSelectedTimeBlocks(newTimeBlocks);
        return;
      }
      
      // 중간 타일을 클릭한 경우 - 아무 기능도 하지 않음
      if (currentIndex > firstIndex && currentIndex < lastIndex) {
        return;
      }
    }
    
    if (newTimeBlocks.includes(time)) {
      // 이미 선택된 시간이면 제거
      newTimeBlocks = newTimeBlocks.filter((t) => t !== time);
    } else {
      // 새로운 시간 추가 (최대 6개)
      if (newTimeBlocks.length >= 7) {
        alert("최대 예약 가능 시간은 3시간입니다.");
        return;
      }
      
      // 연속된 시간 범위 자동 선택 로직
      if (newTimeBlocks.length === 0) {
        // 첫 번째 선택
        newTimeBlocks.push(time);
      } else {
        // 두 번째 이상 선택 - 연속된 범위 자동 채우기
        const allTimes = getTimes();
        const currentIndex = allTimes.indexOf(time);
        const firstIndex = allTimes.indexOf(newTimeBlocks[0]);
        const lastIndex = allTimes.indexOf(newTimeBlocks[newTimeBlocks.length - 1]);
        
        // 선택된 시간이 기존 범위의 앞쪽인지 뒤쪽인지 확인
        if (currentIndex < firstIndex) {
          // 앞쪽에 선택 - 앞쪽부터 현재까지 모든 시간 선택
          newTimeBlocks = [];
          for (let i = currentIndex; i <= lastIndex; i++) {
            const timeSlot = allTimes[i];
            if (!reserved.includes(timeSlot)) {
              newTimeBlocks.push(timeSlot);
            }
          }
        } else if (currentIndex > lastIndex) {
          // 뒤쪽에 선택 - 첫 번째부터 현재까지 모든 시간 선택
          newTimeBlocks = [];
          for (let i = firstIndex; i <= currentIndex; i++) {
            const timeSlot = allTimes[i];
            if (!reserved.includes(timeSlot)) {
              newTimeBlocks.push(timeSlot);
            }
          }
        }
        
        // 최대 6개 블록 제한 확인
        if (newTimeBlocks.length > 7) {
          alert("최대 예약 가능 시간은 3시간입니다.");
          return;
        }
      }
    }

    // 시간 순서대로 정렬
    newTimeBlocks.sort();
    
    // 선택된 시간 블록 업데이트
    setSelectedTimeBlocks(newTimeBlocks);
    
    // 선택된 시간이 있을 때만 onChange 호출
    if (newTimeBlocks.length > 0) {
      const [startHour, startMin] = newTimeBlocks[0].split(":").map(Number);
      const [endHour, endMin] = newTimeBlocks[newTimeBlocks.length - 1].split(":").map(Number);

      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(startHour, startMin, 0, 0);

      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(endHour, endMin, 0, 0);

      onChange({
        visitDate: selectedDate,
        startTime: startDateTime,
        endTime: endDateTime,
      });
    }
  };

  // 일요일(0)만 선택 가능
  const isAvailableDay = (date: Date) => {
    const day = date.getDay();
    return day === 0; // 일요일
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck <= today;
  };

  /** 이번 주 월요일 00:00 (로컬). 일요일은 직전 주의 일요일이 아니라 해당 주의 일요일로 묶음 */
  const startOfWeekMonday = (d: Date): Date => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    const day = copy.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diffToMonday);
    return copy;
  };

  const addDays = (d: Date, n: number): Date => {
    const next = new Date(d);
    next.setDate(next.getDate() + n);
    return next;
  };

  /** 다음 주·다다음 주(월~일 두 구간)는 신청 불가 */
  const isClosedBookingWeek = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonday = startOfWeekMonday(today);
    const nextWeekStart = addDays(thisMonday, 7);
    const weekAfterNextStart = addDays(thisMonday, 14);
    const nextWeekEnd = addDays(nextWeekStart, 7);
    const weekAfterNextEnd = addDays(weekAfterNextStart, 7);

    const check = new Date(date);
    check.setHours(0, 0, 0, 0);

    const inNextWeek = check >= nextWeekStart && check < nextWeekEnd;
    const inWeekAfterNext = check >= weekAfterNextStart && check < weekAfterNextEnd;
    return inNextWeek || inWeekAfterNext;
  };

  const isSunday = (date: Date) => {
    return date.getDay() === 0;
  };

  // 분을 시간과 분으로 변환하는 함수
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}분`;
    } else if (mins === 0) {
      return `${hours}시간`;
    } else {
      return `${hours}시간 ${mins}분`;
    }
  };

  return (
    <div className={cn("dateTimeSelector")}>
      <div className={cn("calendarContainer")}>
        <Calendar
          locale="ko-KR"
          calendarType="gregory"
          onChange={(value) => handleDateChange(value as Date)}
          value={selectedDate}
          tileDisabled={({ date }) =>
            isPastDate(date) ||
            !isAvailableDay(date) ||
            isBlockedDate(date)
          }
          className={cn("customCalendar")}
          prev2Label={null}
          next2Label={null}
          prevLabel={
            <img
              src="/arrow_left_M.svg"
              alt="이전 달"
              className={cn("calendarNavArrow", "calendarNavArrowPrev")}
            />
          }
          nextLabel={
            <img
              src="/arrow_right_L.svg"
              alt="다음 달"
              className={cn("calendarNavArrow", "calendarNavArrowNext")}
            />
          }
          formatMonthYear={(locale, date) => {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            return `${year}.${month}`;
          }}
          formatDay={(locale, date) => {
            return date.getDate().toString();
          }}
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              const dateKey = formatLocalDate(date);
              const isSelected = selectedDate && dateKey === formatLocalDate(selectedDate);
              const isPast = isPastDate(date);
              const isAvailable = isAvailableDay(date);
              const isSundayDay = isSunday(date);
              const isBlocked = isBlockedDate(date);
              
              return cn({
                'calendarTile': true,
                'selectedTile': isSelected,
                'pastTile': isPast,
                'sundayTile': isSundayDay,
                'availableTile': isAvailable,
                'disabledTile': isPast || !isAvailable || isBlocked
              });
            }
            return '';
          }}
          formatShortWeekday={(locale, date) => {
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            return days[date.getDay()];
          }}
          showNeighboringMonth={true}
          maxDetail="month"
          minDetail="month"
          showFixedNumberOfWeeks={false}
          tileContent={({ date, view }) => {
            if (view === 'month') {
              const currentMonth = new Date().getMonth();
              const dateMonth = date.getMonth();
              if (dateMonth !== currentMonth) {
                return null;
              }
            }
            return null;
          }}
        />

        {selectedDate && (
          <div className={cn("timeSelectionContainer")}>
            {isLoadingReservedTimes && (
              <div className={cn("loadingMessage")}>
                <p>예약 가능한 시간을 불러오는 중...</p>
              </div>
            )}
            <div className={cn("timeGrid")}>
              {getTimes().map((time) => {
                const dateKey = formatLocalDate(selectedDate);
                const reserved = reservedTimes[dateKey] || [];
                const isReserved = reserved.includes(time);
                const isSelected = selectedTimeBlocks.includes(time);
                
                // 연속된 시간 블록에서의 위치 확인
                const isSingleTime = selectedTimeBlocks.length === 1 && isSelected;
                const isStartTime = isSelected && selectedTimeBlocks.length > 1 && time === selectedTimeBlocks[0];
                const isEndTime = isSelected && selectedTimeBlocks.length > 1 && time === selectedTimeBlocks[selectedTimeBlocks.length - 1];
                const isMiddleTime = isSelected && !isStartTime && !isEndTime && !isSingleTime;

                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeClick(time)}
                    disabled={isReserved || isLoadingReservedTimes}
                    className={cn({
                      'timeButton': true,
                      'reservedTime': isReserved,
                      'selectedTime': isSelected,
                      'singleTime': isSingleTime,
                      'startTime': isStartTime,
                      'endTime': isEndTime,
                      'middleTime': isMiddleTime,
                      'loadingTime': isLoadingReservedTimes
                    })}
                  >
                    <span className={cn("timeText")}>{time}</span>
                    {isStartTime && <span className={cn("timeLabel")}>시작</span>}
                    {isEndTime && <span className={cn("timeLabel")}>종료</span>}
                  </button>
                );
              })}
            </div>
            
            {selectedTimeBlocks.length > 0 && (
              <div className={cn("selectedTimesInfo")}>
                <p>선택된 시간: {selectedDate?.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} {selectedTimeBlocks.length > 1 ? `${selectedTimeBlocks[0]} ~ ${selectedTimeBlocks[selectedTimeBlocks.length - 1]}` : selectedTimeBlocks[0]}</p>
                <p>총 예약 시간: {(() => {
                  // 시작 시간과 종료 시간의 실제 차이를 계산
                  const startTime = selectedTimeBlocks[0];
                  const endTime = selectedTimeBlocks[selectedTimeBlocks.length - 1];
                  const [startHour, startMin] = startTime.split(":").map(Number);
                  const [endHour, endMin] = endTime.split(":").map(Number);
                  
                  // 시작 시간과 종료 시간을 분 단위로 변환
                  const startMinutes = startHour * 60 + startMin;
                  const endMinutes = endHour * 60 + endMin;
                  
                  // 시간 차이 계산 (종료 시간 - 시작 시간)
                  const durationMinutes = endMinutes - startMinutes;
                  
                  return formatDuration(durationMinutes);
                })()}</p>
                <p className={cn("timeLimitInfo")}>최대 예약 가능: 3시간</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


