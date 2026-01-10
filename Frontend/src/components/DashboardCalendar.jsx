import React, { useState } from 'react';
import { reservationsData, propertiesData } from '../data/mockData';
import '../styles/components/dashboardCalendar.css';

const DashboardCalendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)); // Start at Jan 2026 based on mock data

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const renderCalendarDays = () => {
        const days = [];
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);

        // Empty slots for days before the 1st
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of the month
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            // Find reservations for this day
            const dayReservations = reservationsData.filter(res => {
                return dateStr >= res.checkIn && dateStr <= res.checkOut;
            });

            days.push(
                <div key={d} className="calendar-day">
                    <div className="day-number">{d}</div>
                    {dayReservations.map(res => {
                        const prop = propertiesData.find(p => p.id === res.propertyId);
                        const color = res.status === 'Confirmed' ? '#28a745' : (res.status === 'Pending' ? '#ffc107' : '#dc3545');

                        return (
                            <div key={res.id}
                                className="reservation-item"
                                style={{ backgroundColor: color }}
                                title={`${res.guestName} - ${prop?.name}`}
                            >
                                {res.guestName}
                            </div>
                        );
                    })}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="dashboard-content dashboard-calendar-content">
            <div className="calendar-header-controls">
                <h2>Calendar</h2>
                <div className="calendar-nav">
                    <button onClick={prevMonth} className="btn-nav">&lt;</button>
                    <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
                    <button onClick={nextMonth} className="btn-nav">&gt;</button>
                </div>
            </div>

            <div className="calendar-container">
                <div className="calendar-weekdays">
                    <div className="weekday">Sun</div>
                    <div className="weekday">Mon</div>
                    <div className="weekday">Tue</div>
                    <div className="weekday">Wed</div>
                    <div className="weekday">Thu</div>
                    <div className="weekday">Fri</div>
                    <div className="weekday">Sat</div>
                </div>
                <div className="calendar-grid">
                    {renderCalendarDays()}
                </div>
            </div>
        </div>
    );
};

export default DashboardCalendar;
