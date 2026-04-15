import { useState } from "react";
import Calendar from "react-calendar";
import classNames from "classnames/bind";
import styles from "../../styles/Modify.module.scss";
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

  // 로컬 ?�짜�?yyyy-mm-dd ?�식?�로 변?�하???�수
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = async (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeBlocks([]);
    
    // ?�짜�?로컬 ?�간 기�??�로 yyyy-mm-dd ?�식?�로 변??
    const dateKey = formatLocalDate(date);
    
    // ?��? 로드???�약 ?�간???�으�??�사??
    if (reservedTimes[dateKey]) {
      return;
    }
    
    // API ?�출?�여 ?�약???�간 가?�오�?
    setIsLoadingReservedTimes(true);
    try {
      const response = await getReservationReserved(dateKey);
      
      if (response && response.data) {
        // API ?�답 ?�식???�라 ?�약???�간 배열 추출
        // ?�답??배열??경우?� 객체??경우 모두 처리
        let reservedTimeSlots: TimeSlot[] = [];
        
        if (Array.isArray(response.data)) {
          reservedTimeSlots = response.data;
        } else if (response.data.times && Array.isArray(response.data.times)) {
          reservedTimeSlots = response.data.times;
        } else if (response.data.reservedTimes && Array.isArray(response.data.reservedTimes)) {
          reservedTimeSlots = response.data.reservedTimes;
        }
        
        // ?�약???�간???�태???�??
        setReservedTimes(prev => ({
          ...prev,
          [dateKey]: reservedTimeSlots
        }));
      } else {
        // ?�답???�거???�이?��? ?�으�?�?배열�??�정
        setReservedTimes(prev => ({
          ...prev,
          [dateKey]: []
        }));
      }
    } catch (error) {
      console.error('?�약???�간 조회 ?�패:', error);
      // ?�러 발생 ??�?배열�??�정
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
    
    // 중간 ?�?�인지 ?�인
    if (newTimeBlocks.length > 1) {
      const allTimes = getTimes();
      const currentIndex = allTimes.indexOf(time);
      const firstIndex = allTimes.indexOf(newTimeBlocks[0]);
      const lastIndex = allTimes.indexOf(newTimeBlocks[newTimeBlocks.length - 1]);
      
      // ?�작 ?�간???�시 ?�릭??경우 - 모든 ?�택 ?�제
      if (time === newTimeBlocks[0]) {
        newTimeBlocks = [];
        setSelectedTimeBlocks(newTimeBlocks);
        return;
      }
      
      // 중간 ?�?�을 ?�릭??경우 - ?�무 기능???��? ?�음
      if (currentIndex > firstIndex && currentIndex < lastIndex) {
        return;
      }
    }
    
    if (newTimeBlocks.includes(time)) {
      // ?��? ?�택???�간?�면 ?�거
      newTimeBlocks = newTimeBlocks.filter((t) => t !== time);
    } else {
      // ?�로???�간 추�? (최�? 6�?
      if (newTimeBlocks.length >= 7) {
        alert("최�? ?�약 가???�간?� 3?�간?�니??");
        return;
      }
      
      // ?�속???�간 범위 ?�동 ?�택 로직
      if (newTimeBlocks.length === 0) {
        // �?번째 ?�택
        newTimeBlocks.push(time);
      } else {
        // ??번째 ?�상 ?�택 - ?�속??범위 ?�동 채우�?
        const allTimes = getTimes();
        const currentIndex = allTimes.indexOf(time);
        const firstIndex = allTimes.indexOf(newTimeBlocks[0]);
        const lastIndex = allTimes.indexOf(newTimeBlocks[newTimeBlocks.length - 1]);
        
        // ?�택???�간??기존 범위???�쪽?��? ?�쪽?��? ?�인
        if (currentIndex < firstIndex) {
          // ?�쪽???�택 - ?�쪽부???�재까�? 모든 ?�간 ?�택
          newTimeBlocks = [];
          for (let i = currentIndex; i <= lastIndex; i++) {
            const timeSlot = allTimes[i];
            if (!reserved.includes(timeSlot)) {
              newTimeBlocks.push(timeSlot);
            }
          }
        } else if (currentIndex > lastIndex) {
          // ?�쪽???�택 - �?번째부???�재까�? 모든 ?�간 ?�택
          newTimeBlocks = [];
          for (let i = firstIndex; i <= currentIndex; i++) {
            const timeSlot = allTimes[i];
            if (!reserved.includes(timeSlot)) {
              newTimeBlocks.push(timeSlot);
            }
          }
        }
        
        // 최�? 6�?블록 ?�한 ?�인
        if (newTimeBlocks.length > 7) {
          alert("최�? ?�약 가???�간?� 3?�간?�니??");
          return;
        }
      }
    }

    // ?�간 ?�서?��??�렬
    newTimeBlocks.sort();
    
    // ?�택???�간 블록 ?�데?�트
    setSelectedTimeBlocks(newTimeBlocks);
    
    // ?�택???�간???�을 ?�만 onChange ?�출
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

  // ?�요??0)�??�택 가??
  const isAvailableDay = (date: Date) => {
    const day = date.getDay();
    return day === 0; // ?�요??
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck <= today;
  };

  const isSunday = (date: Date) => {
    return date.getDay() === 0;
  };

  // 분을 ?�간�?분으�?변?�하???�수
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}�?;
    } else if (mins === 0) {
      return `${hours}?�간`;
    } else {
      return `${hours}?�간 ${mins}�?;
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
          tileDisabled={({ date }) => isPastDate(date) || !isAvailableDay(date)}
          className={cn("customCalendar")}
          prev2Label={null}
          next2Label={null}
          prevLabel={
            <img
              src="/arrow_left_M.svg"
              alt="?�전 ??
              className={cn("calendarNavArrow", "calendarNavArrowPrev")}
            />
          }
          nextLabel={
            <img
              src="/arrow_right_L.svg"
              alt="?�음 ??
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
              
              return cn({
                'calendarTile': true,
                'selectedTile': isSelected,
                'pastTile': isPast,
                'sundayTile': isSundayDay,
                'availableTile': isAvailable,
                'disabledTile': isPast || !isAvailable
              });
            }
            return '';
          }}
          formatShortWeekday={(locale, date) => {
            const days = ['??, '??, '??, '??, '�?, '�?, '??];
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
                <p>?�약 가?�한 ?�간??불러?�는 �?..</p>
              </div>
            )}
            <div className={cn("timeGrid")}>
              {getTimes().map((time) => {
                const dateKey = formatLocalDate(selectedDate);
                const reserved = reservedTimes[dateKey] || [];
                const isReserved = reserved.includes(time);
                const isSelected = selectedTimeBlocks.includes(time);
                
                // ?�속???�간 블록?�서???�치 ?�인
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
                    {isStartTime && <span className={cn("timeLabel")}>?�작</span>}
                    {isEndTime && <span className={cn("timeLabel")}>종료</span>}
                  </button>
                );
              })}
            </div>
            
            {selectedTimeBlocks.length > 0 && (
              <div className={cn("selectedTimesInfo")}>
                <p>?�택???�간: {selectedDate?.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} {selectedTimeBlocks.length > 1 ? `${selectedTimeBlocks[0]} ~ ${selectedTimeBlocks[selectedTimeBlocks.length - 1]}` : selectedTimeBlocks[0]}</p>
                <p>�??�약 ?�간: {(() => {
                  // ?�작 ?�간�?종료 ?�간???�제 차이�?계산
                  const startTime = selectedTimeBlocks[0];
                  const endTime = selectedTimeBlocks[selectedTimeBlocks.length - 1];
                  const [startHour, startMin] = startTime.split(":").map(Number);
                  const [endHour, endMin] = endTime.split(":").map(Number);
                  
                  // ?�작 ?�간�?종료 ?�간??�??�위�?변??
                  const startMinutes = startHour * 60 + startMin;
                  const endMinutes = endHour * 60 + endMin;
                  
                  // ?�간 차이 계산 (종료 ?�간 - ?�작 ?�간)
                  const durationMinutes = endMinutes - startMinutes;
                  
                  return formatDuration(durationMinutes);
                })()}</p>
                <p className={cn("timeLimitInfo")}>최�? ?�약 가?? 3?�간</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


