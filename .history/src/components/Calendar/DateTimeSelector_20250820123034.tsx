import { useState } from "react";
import Calendar from "react-calendar";
import classNames from "classnames/bind";
import styles from "@/styles/Modify.module.scss";

const cn = classNames.bind(styles);
type TimeSlot = string;

export default function DateTimeSelector() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<TimeSlot | null>(null);
  const [endTime, setEndTime] = useState<TimeSlot | null>(null);

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
    setStartTime(null);
    setEndTime(null);
  };

  const handleTimeClick = (time: TimeSlot) => {
    if (!selectedDate) return;
    const dateKey = selectedDate.toISOString().split("T")[0];
    const reserved = reservedTimes[dateKey] || [];

    if (reserved.includes(time)) return;

    if (!startTime) {
      setStartTime(time);
    } else if (!endTime && time !== startTime) {
      // 시작 시간보다 늦은 시간만 종료 시간으로 선택 가능
      const startHour = parseInt(startTime.split(":")[0]);
      const startMin = parseInt(startTime.split(":")[1]);
      const endHour = parseInt(time.split(":")[0]);
      const endMin = parseInt(time.split(":")[1]);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (endMinutes > startMinutes) {
        setEndTime(time);
      }
    } else if (time === startTime) {
      setStartTime(null);
      setEndTime(null);
    } else if (time === endTime) {
      setEndTime(null);
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

  return (
    <div className={cn("dateTimeSelector")}>
      <label className={cn("dateTimeLabel")}>
        날짜 및 시간 <span className={cn("required")}>(필수)</span>
      </label>
      
      <div className={cn("calendarContainer")}>
        <Calendar
          locale="ko-KR"
          onChange={(value) => handleDateChange(value as Date)}
          value={selectedDate}
          tileDisabled={({ date }) => !isWeekend(date) || isPastDate(date)}
          className={cn("customCalendar")}
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              const dateKey = date.toISOString().split("T")[0];
              const isSelected = selectedDate && dateKey === selectedDate.toISOString().split("T")[0];
              const isPast = isPastDate(date);
              const isWeekendDay = isWeekend(date);
              
              return cn({
                'calendarTile': true,
                'selectedTile': isSelected,
                'pastTile': isPast,
                'weekendTile': isWeekendDay,
                'disabledTile': !isWeekendDay || isPast
              });
            }
            return '';
          }}
        />

        {selectedDate && (
          <div className={cn("timeSelectionContainer")}>
            <h3 className={cn("timeSelectionTitle")}>시간 선택</h3>
            <div className={cn("timeGrid")}>
              {getTimes().map((time) => {
                const dateKey = selectedDate.toISOString().split("T")[0];
                const reserved = reservedTimes[dateKey] || [];
                const isReserved = reserved.includes(time);
                const isStartTime = startTime === time;
                const isEndTime = endTime === time;

                return (
                  <button
                    key={time}
                    onClick={() => handleTimeClick(time)}
                    disabled={isReserved}
                    className={cn({
                      'timeButton': true,
                      'reservedTime': isReserved,
                      'startTime': isStartTime,
                      'endTime': isEndTime
                    })}
                  >
                    <span className={cn("timeText")}>{time}</span>
                    {isStartTime && <span className={cn("timeLabel")}>시작</span>}
                    {isEndTime && <span className={cn("timeLabel")}>종료</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


