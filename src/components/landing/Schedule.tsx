'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUser } from '@fortawesome/free-solid-svg-icons';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const scheduleData: Record<string, Array<{
  time: string;
  className: string;
  description: string;
  trainer: string;
  spots: number;
}>> = {
  Monday: [
    { time: '6:00 AM', className: 'Morning HIIT', description: 'High-intensity interval training to kickstart your day', trainer: 'Coach Emeka', spots: 8 },
    { time: '8:00 AM', className: 'Power Yoga', description: 'Build strength and flexibility through dynamic poses', trainer: 'Coach Adaeze', spots: 12 },
    { time: '10:00 AM', className: 'Strength Training', description: 'Build muscle and increase power with guided lifting', trainer: 'Coach Tunde', spots: 5 },
    { time: '4:00 PM', className: 'Spin Class', description: 'Heart-pumping cycling session with energizing music', trainer: 'Coach Funke', spots: 3 },
    { time: '6:00 PM', className: 'CrossFit WOD', description: 'Workout of the day combining various functional movements', trainer: 'Coach Chidi', spots: 10 },
  ],
  Tuesday: [
    { time: '6:00 AM', className: 'Power Yoga', description: 'Build strength and flexibility through dynamic poses', trainer: 'Coach Adaeze', spots: 15 },
    { time: '9:00 AM', className: 'Pilates', description: 'Core strengthening and body conditioning', trainer: 'Coach Funke', spots: 10 },
    { time: '12:00 PM', className: 'Lunch HIIT', description: 'Quick high-intensity session for busy professionals', trainer: 'Coach Emeka', spots: 6 },
    { time: '5:00 PM', className: 'Boxing Basics', description: 'Learn boxing fundamentals and get a great workout', trainer: 'Coach Chidi', spots: 8 },
    { time: '7:00 PM', className: 'Strength Training', description: 'Build muscle and increase power with guided lifting', trainer: 'Coach Tunde', spots: 4 },
  ],
  Wednesday: [
    { time: '6:00 AM', className: 'Morning HIIT', description: 'High-intensity interval training to kickstart your day', trainer: 'Coach Emeka', spots: 10 },
    { time: '8:00 AM', className: 'Spin Class', description: 'Heart-pumping cycling session with energizing music', trainer: 'Coach Funke', spots: 5 },
    { time: '11:00 AM', className: 'Power Yoga', description: 'Build strength and flexibility through dynamic poses', trainer: 'Coach Adaeze', spots: 14 },
    { time: '4:00 PM', className: 'CrossFit WOD', description: 'Workout of the day combining various functional movements', trainer: 'Coach Chidi', spots: 7 },
    { time: '6:00 PM', className: 'Strength Training', description: 'Build muscle and increase power with guided lifting', trainer: 'Coach Tunde', spots: 6 },
  ],
  Thursday: [
    { time: '6:00 AM', className: 'Power Yoga', description: 'Build strength and flexibility through dynamic poses', trainer: 'Coach Adaeze', spots: 12 },
    { time: '9:00 AM', className: 'Pilates', description: 'Core strengthening and body conditioning', trainer: 'Coach Funke', spots: 8 },
    { time: '12:00 PM', className: 'Lunch HIIT', description: 'Quick high-intensity session for busy professionals', trainer: 'Coach Emeka', spots: 5 },
    { time: '5:00 PM', className: 'Boxing Basics', description: 'Learn boxing fundamentals and get a great workout', trainer: 'Coach Chidi', spots: 10 },
    { time: '7:00 PM', className: 'Strength Training', description: 'Build muscle and increase power with guided lifting', trainer: 'Coach Tunde', spots: 3 },
  ],
  Friday: [
    { time: '6:00 AM', className: 'Morning HIIT', description: 'High-intensity interval training to kickstart your day', trainer: 'Coach Emeka', spots: 9 },
    { time: '8:00 AM', className: 'Power Yoga', description: 'Build strength and flexibility through dynamic poses', trainer: 'Coach Adaeze', spots: 11 },
    { time: '10:00 AM', className: 'Spin Class', description: 'Heart-pumping cycling session with energizing music', trainer: 'Coach Funke', spots: 4 },
    { time: '4:00 PM', className: 'CrossFit WOD', description: 'Workout of the day combining various functional movements', trainer: 'Coach Chidi', spots: 8 },
    { time: '6:00 PM', className: 'Strength Training', description: 'Build muscle and increase power with guided lifting', trainer: 'Coach Tunde', spots: 7 },
  ],
  Saturday: [
    { time: '8:00 AM', className: 'Weekend Warrior HIIT', description: 'Extended high-intensity session for the weekend', trainer: 'Coach Emeka', spots: 15 },
    { time: '10:00 AM', className: 'Power Yoga', description: 'Build strength and flexibility through dynamic poses', trainer: 'Coach Adaeze', spots: 18 },
    { time: '12:00 PM', className: 'CrossFit WOD', description: 'Workout of the day combining various functional movements', trainer: 'Coach Chidi', spots: 12 },
    { time: '2:00 PM', className: 'Spin Class', description: 'Heart-pumping cycling session with energizing music', trainer: 'Coach Funke', spots: 6 },
  ],
  Sunday: [
    { time: '9:00 AM', className: 'Restorative Yoga', description: 'Gentle yoga to restore and rejuvenate', trainer: 'Coach Adaeze', spots: 20 },
    { time: '11:00 AM', className: 'Light Strength', description: 'Low-impact strength training for recovery', trainer: 'Coach Tunde', spots: 10 },
    { time: '1:00 PM', className: 'Spin Class', description: 'Heart-pumping cycling session with energizing music', trainer: 'Coach Funke', spots: 8 },
  ],
};

export default function Schedule() {
  const [activeDay, setActiveDay] = useState('Monday');

  return (
    <section id="schedule" className="py-16 md:py-24 lg:py-32 bg-[#141414]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <span className="inline-block bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)] px-3 md:px-4 py-2 text-[0.7rem] md:text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#6366F1] mb-4 md:mb-6">
            Class Schedule
          </span>
          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-3 md:mb-4">
            FIND YOUR PERFECT CLASS
          </h2>
          <p className="text-[#A0A0A0] text-base md:text-[1.1rem]">
            From high-intensity workouts to mindful yoga sessions, we have something for everyone.
          </p>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-6 md:mb-8 flex-wrap justify-center">
          {days.map((day, index) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3 sm:px-4 md:px-6 py-2 md:py-3 font-medium text-[0.7rem] sm:text-[0.75rem] md:text-[0.85rem] uppercase tracking-wider md:tracking-widest transition-all duration-300 ${
                activeDay === day
                  ? 'bg-[#6366F1] border-[#6366F1] text-white'
                  : 'bg-transparent border border-white/10 text-[#A0A0A0] hover:bg-[#6366F1] hover:border-[#6366F1] hover:text-white'
              }`}
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{shortDays[index]}</span>
            </button>
          ))}
        </div>

        {/* Schedule Grid */}
        <div className="grid gap-3 md:gap-4">
          {scheduleData[activeDay]?.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 lg:grid-cols-[100px_1fr_140px_90px] gap-2 md:gap-4 lg:gap-8 items-center bg-[#0A0A0A] border border-white/5 p-4 md:p-6 lg:px-8 transition-all duration-300 hover:border-[rgba(99,102,241,0.3)] lg:hover:translate-x-2.5"
            >
              <div className="font-['Bebas_Neue'] text-lg md:text-xl lg:text-[1.3rem] text-[#6366F1] flex items-center gap-2 lg:block">
                <FontAwesomeIcon icon={faClock} className="text-sm lg:hidden" />
                {item.time}
              </div>
              <div>
                <h4 className="text-base md:text-[1.1rem] mb-0.5 md:mb-1">{item.className}</h4>
                <p className="text-[#A0A0A0] text-xs md:text-[0.85rem] hidden sm:block">{item.description}</p>
              </div>
              <div className="text-[#A0A0A0] text-sm md:text-[0.9rem] flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-xs text-[#6366F1]" />
                {item.trainer}
              </div>
              <div className="text-xs md:text-[0.85rem] lg:text-right">
                <span className="text-[#6366F1] font-semibold">{item.spots}</span> spots left
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
