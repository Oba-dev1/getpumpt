'use client';

import { useState, useMemo } from 'react';
import { User, MapPin } from 'lucide-react';
import type { ClassSchedule } from '@/types/gym';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ScheduleProps {
  schedules: ClassSchedule[];
}

export default function Schedule({ schedules = [] }: ScheduleProps) {
  const [activeDay, setActiveDay] = useState(days[new Date().getDay() - 1] || 'Monday');

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
    <section id="schedule" className="bg-[#0F0F14] py-16 md:py-24 lg:py-32">
      <div className="container-custom">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16 lg:mb-20">
          <span className="mb-6 inline-block rounded-full border border-[rgba(var(--gym-primary-rgb),0.3)] bg-[rgba(var(--gym-primary-rgb),0.1)] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))]">
            Class Schedule
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Find Your Perfect Class
          </h2>
          <p className="text-base text-slate-400 md:text-lg">
            From high-intensity workouts to mindful yoga sessions, we have something for everyone.
          </p>
        </div>

        <div className="mb-8 flex justify-center md:mb-12">
          <div className="flex flex-wrap justify-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1.5 backdrop-blur-sm">
            {days.map((day, index) => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 sm:px-5 ${
                  activeDay === day
                    ? 'bg-[rgb(var(--gym-primary))] text-white shadow-lg shadow-[rgba(var(--gym-primary-rgb),0.3)]'
                    : 'text-slate-500 hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{shortDays[index]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:gap-4">
          {groupedSchedules[activeDay]?.length > 0 ? (
            groupedSchedules[activeDay].map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[80px,1fr] items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-300 hover:border-[rgba(var(--gym-primary-rgb),0.2)] hover:bg-white/[0.04] md:grid-cols-[120px,1fr,180px,150px] md:p-5"
              >
                <div className="text-lg font-bold text-[rgb(var(--gym-primary))] md:text-xl">
                  {formatTime(item.startTime)}
                </div>

                <div className="md:col-span-1">
                  <h4 className="mb-1 text-base font-semibold text-white md:text-lg">{item.gymClass.name}</h4>
                  <p className="hidden text-sm text-slate-500 sm:block">{item.gymClass.description}</p>
                </div>

                <div className="col-span-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400 md:col-span-1 md:text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-[rgb(var(--gym-primary))]" />
                    <span>{item.trainer.firstName} {item.trainer.lastName}</span>
                  </div>
                  {item.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-[rgb(var(--gym-primary))]" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>

                <div className="col-span-2 flex justify-end md:col-span-1">
                  <button className="rounded-xl bg-[rgb(var(--gym-primary))] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)]">
                    Book Spot
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-12 text-center">
              <p className="text-lg text-slate-500">No classes scheduled for {activeDay}.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
