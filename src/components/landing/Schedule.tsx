'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUser, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import type { ClassSchedule } from '@/types/gym';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ScheduleProps {
  schedules: ClassSchedule[];
}

export default function Schedule({ schedules = [] }: ScheduleProps) {
  const [activeDay, setActiveDay] = useState(days[new Date().getDay() -1] || 'Monday');

  const groupedSchedules = useMemo(() => {
    const grouped: Record<string, ClassSchedule[]> = {};
    days.forEach(day => grouped[day] = []);
    schedules.forEach(schedule => {
      if (grouped[schedule.dayOfWeek]) {
        grouped[schedule.dayOfWeek].push(schedule);
      }
    });
    return grouped;
  }, [schedules]);

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  return (
    <section id="schedule" className="py-16 md:py-24 lg:py-32 bg-[#141414]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <span className="inline-block bg-[rgba(var(--gym-primary-rgb),0.1)] border border-[rgba(var(--gym-primary-rgb),0.3)] px-3 md:px-4 py-2 text-[0.7rem] md:text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gym-primary))] mb-4 md:mb-6 rounded-md">
            Class Schedule
          </span>
          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-3 md:mb-4 text-white">
            Find Your Perfect Class
          </h2>
          <p className="text-[#A0A0A0] text-base md:text-[1.1rem]">
            From high-intensity workouts to mindful yoga sessions, we have something for everyone.
          </p>
        </div>

        {/* Day Tabs */}
        <div className="flex justify-center mb-8 md:mb-12">
            <div className="bg-[#0A0A0A] border border-white/5 p-1.5 rounded-lg flex flex-wrap justify-center">
                {days.map((day, index) => (
                    <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-3 sm:px-4 md:px-5 py-2 md:py-2.5 font-semibold text-sm rounded-md transition-all duration-300 ${
                        activeDay === day
                        ? 'bg-[rgb(var(--gym-primary))] text-white shadow-md'
                        : 'text-[#A0A0A0] hover:text-white'
                    }`}
                    >
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{shortDays[index]}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid gap-3 md:gap-4">
          {groupedSchedules[activeDay]?.length > 0 ? (
            groupedSchedules[activeDay].map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[80px,1fr] md:grid-cols-[120px,1fr,180px,150px] gap-4 items-center bg-[#0A0A0A] border border-white/5 p-4 rounded-lg transition-all duration-300 hover:border-[rgba(var(--gym-primary-rgb),0.3)] hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.05)]"
              >
                <div className="font-['Bebas_Neue'] text-lg md:text-xl text-[rgb(var(--gym-primary))]">
                  {formatTime(item.startTime)}
                </div>
                
                <div className="md:col-span-1">
                  <h4 className="text-base md:text-lg font-semibold text-white mb-1">{item.gymClass.name}</h4>
                  <p className="text-[#A0A0A0] text-xs md:text-sm hidden sm:block">{item.gymClass.description}</p>
                </div>

                <div className="col-span-2 md:col-span-1 flex flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm text-[#A0A0A0]">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} className="text-[rgb(var(--gym-primary))]" />
                        <span>{item.trainer.firstName} {item.trainer.lastName}</span>
                    </div>
                    {item.location && (
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-[rgb(var(--gym-primary))]" />
                            <span>{item.location}</span>
                        </div>
                    )}
                </div>
                
                <div className="col-span-2 md:col-span-1 flex justify-end">
                    <button className="bg-[rgb(var(--gym-primary))] text-white font-bold py-2 px-4 rounded-md text-sm hover:brightness-110 transition-all duration-300">
                        Book Spot
                    </button>
                </div>

              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-[#0A0A0A] border border-white/5 rounded-lg">
                <p className="text-lg text-[#A0A0A0]">No classes scheduled for {activeDay}.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}