import { useState } from "react";
import Calendar from "react-calendar";
import classNames from "classnames/bind";
import styles from "@/styles/Modify.module.scss";

const cn = classNames.bind(styles);
type TimeSlot = string;

export default function DateTimeSelector() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<TimeSlot[]>([]);

  const reservedTimes: { [key: string]: TimeSlot[] } = {
    "2024-12-14": ["10:00", "10:30", "14:00"],
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
    setSelectedTimes([]);
  };

  const handleTimeClick = (time: TimeSlot) => {
    if (!selectedDate) return;
    const dateKey = selectedDate.toISOString().split("T")[0];
    const reserved = reservedTimes[dateKey] || [];

    if (reserved.includes(time)) return;

    let newTimes = [...selectedTimes];
    if (newTimes.includes(time)) {
      newTimes = newTimes.filter((t) => t !== time);
    } else {
      newTimes.push(time);
    }

    newTimes.sort();
    const duration = newTimes.length * 30; // minutes
    if (duration > 180) return;

    setSelectedTimes(newTimes);
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  return (
    <div className={cn("inputGroup")}>
      <label>
        날짜 및 시간 <span className={cn("required")}>(필수)</span>
      </label>
      <div className={cn("calendarPlaceholder")}>
        <Calendar
          locale="customKo"
          onChange={(value) => handleDateChange(value as Date)}
          value={selectedDate}
          tileDisabled={({ date }) => !isWeekend(date)}
        />

        {selectedDate && (
          <div>
            <h3>시간 선택</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {getTimes().map((time) => {
                const dateKey = selectedDate.toISOString().split("T")[0];
                const reserved = reservedTimes[dateKey] || [];
                const isReserved = reserved.includes(time);
                const isSelected = selectedTimes.includes(time);

                return (
                  <button
                    key={time}
                    onClick={() => handleTimeClick(time)}
                    disabled={isReserved}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: isSelected ? "2px solid green" : "1px solid #ccc",
                      background: isReserved ? "#eee" : isSelected ? "#c7f9cc" : "white",
                      cursor: isReserved ? "not-allowed" : "pointer",
                    }}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {selectedTimes.length > 0 && (
          <p>선택된 시간: {selectedTimes.join(", ")}</p>
        )}
      </div>
    </div>
  );
}


