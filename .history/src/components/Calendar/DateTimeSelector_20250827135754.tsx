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
      for (const min of [0, 30]) {
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
      newTimeBlocks = newTimeBlocks.filter((t) => t !== time);
    } else {
      // 새로운 시간 추가 (최대 6개)
      if (newTimeBlocks.length >= 6) {
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
        } else {
          // 기존 범위 내부에 선택 - 아무것도 하지 않음
          return;
        }
        
        // 최대 6개 블록 제한 확인
        if (newTimeBlocks.length > 6) {
          alert("최대 예약 가능 시간은 3시간입니다.");
          return;
        }
      }
    }

    // 시간 순서대로 정렬
    newTimeBlocks.sort();
    
    // 선택된 시간 블록 업데이트
    setSelectedTimeBlocks(newTimeBlocks);
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
            
            {selectedTimeBlocks.length > 0 && (
              <div className={cn("selectedTimesInfo")}>
                <p>선택된 시간: {selectedDate?.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} {selectedTimeBlocks.length > 1 ? `${selectedTimeBlocks[0]} ~ ${selectedTimeBlocks[selectedTimeBlocks.length - 1]}` : selectedTimeBlocks[0]}</p>
                <p>총 예약 시간: {selectedTimeBlocks.length * 30}분</p>
                <p className={cn("timeLimitInfo")}>최대 예약 가능: 3시간</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


