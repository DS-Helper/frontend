import { useState } from "react";
import Calendar from "react-calendar";
import classNames from "classnames/bind";
import styles from "@/styles/Modify.module.scss";

const cn = classNames.bind(styles);
type TimeSlot = string;

export default function DateTimeSelector() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeBlocks, setSelectedTimeBlocks] = useState<TimeSlot[]>([]);

  const reservedTimes: { [key: string]: TimeSlot[] } = {
    "2024-12-14": ["10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30"],
  };

  const getTimes = () => {
    const times: TimeSlot[] = [];
    for (let hour = 10; hour <= 17; hour++) {
      for (let min of [0, 30]) {
        if (!(hour === 17 && min === 30)) {
          times.push(`${hour.toString().padStart(2, "0")}:${min === 0 ? "00" : "30"}`);
        }
      }
    }
    return times;
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeBlocks([]);
  };

  const handleTimeClick = (time: TimeSlot) => {
    if (!selectedDate) return;
    const dateKey = selectedDate.toISOString().split("T")[0];
    const reserved = reservedTimes[dateKey] || [];

    if (reserved.includes(time)) return;

    let newTimeBlocks = [...selectedTimeBlocks];
    
    if (newTimeBlocks.includes(time)) {
      // 이미 선택된 시간이면 제거
      if (newTimeBlocks.length === 1) {
        // 마지막 하나만 남은 경우 완전 제거
        newTimeBlocks = [];
      } else {
        // 중간 시간을 클릭한 경우, 해당 시간부터 종료 시간까지 모두 제거
        const timeIndex = newTimeBlocks.indexOf(time);
        if (timeIndex !== -1) {
          // 클릭한 시간부터 끝까지 제거
          newTimeBlocks = newTimeBlocks.slice(0, timeIndex);
        }
      }
    } else {
      // 새로운 시간 추가 (최대 6개)
      if (newTimeBlocks.length >= 6) {
        alert("최대 예약 가능 시간은 3시간입니다.");
        return;
      }
      
      // 연속된 시간만 선택 가능
      if (newTimeBlocks.length === 0) {
        // 첫 번째 선택
        newTimeBlocks.push(time);
      } else {
        // 기존 선택과 연속된 시간인지 확인
        const allTimes = getTimes();
        const currentIndex = allTimes.indexOf(time);
        const selectedIndices = newTimeBlocks.map(t => allTimes.indexOf(t));
        
        // 선택된 시간과 인접한지 확인
        const isAdjacent = selectedIndices.some(index => 
          Math.abs(index - currentIndex) === 1
        );
        
        if (isAdjacent) {
          newTimeBlocks.push(time);
        } else {
          // 연속되지 않은 시간은 선택 불가
          return;
        }
      }
    }

    // 시간 순서대로 정렬
    newTimeBlocks.sort();
    
    // 최소 1개는 선택되어야 함
    if (newTimeBlocks.length >= 1) {
      setSelectedTimeBlocks(newTimeBlocks);
    } else {
      setSelectedTimeBlocks([]);
    }
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSunday = (date: Date) => {
    return date.getDay() === 0;
  };

  const isSaturday = (date: Date) => {
    return date.getDay() === 6;
  };

  return (
    <div className={cn("dateTimeSelector")}>
      <label className={cn("dateTimeLabel")}>
        날짜 및 시간 <span className={cn("required")}>(필수)</span>
      </label>
      
      <div className={cn("calendarContainer")}>
        <Calendar
          locale="ko-KR"
          calendarType="gregory"
          onChange={(value) => handleDateChange(value as Date)}
          value={selectedDate}
          tileDisabled={({ date }) => isPastDate(date)}
          className={cn("customCalendar")}
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              const dateKey = date.toISOString().split("T")[0];
              const isSelected = selectedDate && dateKey === selectedDate.toISOString().split("T")[0];
              const isPast = isPastDate(date);
              const isWeekendDay = isWeekend(date);
              const isSundayDay = isSunday(date);
              const isSaturdayDay = isSaturday(date);
              
              return cn({
                'calendarTile': true,
                'selectedTile': isSelected,
                'pastTile': isPast,
                'sundayTile': isSundayDay,
                'saturdayTile': isSaturdayDay,
                'weekendTile': isWeekendDay,
                'disabledTile': isPast
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
              // 이전/다음 달의 날짜는 표시하지 않음
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
            <div className={cn("timeGrid")}>
              {getTimes().map((time) => {
                const dateKey = selectedDate.toISOString().split("T")[0];
                const reserved = reservedTimes[dateKey] || [];
                const isReserved = reserved.includes(time);
                const isSelected = selectedTimeBlocks.includes(time);
                
                // 연속된 시간 블록에서의 위치 확인
                const isStartTime = isSelected && selectedTimeBlocks.length > 0 && time === selectedTimeBlocks[0];
                const isEndTime = isSelected && selectedTimeBlocks.length > 0 && time === selectedTimeBlocks[selectedTimeBlocks.length - 1];
                const isMiddleTime = isSelected && !isStartTime && !isEndTime;

                return (
                  <button
                    key={time}
                    onClick={() => handleTimeClick(time)}
                    disabled={isReserved}
                    className={cn({
                      'timeButton': true,
                      'reservedTime': isReserved,
                      'selectedTime': isSelected,
                      'startTime': isStartTime,
                      'endTime': isEndTime,
                      'middleTime': isMiddleTime
                    })}
                  >
                    <span className={cn("timeText")}>{time}</span>
                    {isStartTime && <span className={cn("timeLabel")}>시작</span>}
                    {isEndTime && <span className={cn("timeLabel")}>종료</span>}
                  </button>
                );
              })}
            </div>
            
            {/* {selectedTimeBlocks.length > 0 && (
              <div className={cn("selectedTimesInfo")}>
                <p>선택된 시간: {selectedTimeBlocks.join(" ~ ")}</p>
                <p>총 예약 시간: {selectedTimeBlocks.length * 30}분 ({selectedTimeBlocks.length}개 블록)</p>
              </div>
            )} */}
          </div>
        )}
      </div>
    </div>
  );
}


