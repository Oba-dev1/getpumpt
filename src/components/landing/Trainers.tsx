import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

const trainers = [
  {
    name: 'COACH EMEKA',
    specialty: 'HIIT & Functional Training',
    bio: '10+ years experience in high-intensity training. Former national athlete with a passion for pushing limits.',
  },
  {
    name: 'COACH ADAEZE',
    specialty: 'Yoga & Pilates',
    bio: 'Certified yoga instructor specializing in power yoga and mindfulness practices for holistic wellness.',
  },
  {
    name: 'COACH TUNDE',
    specialty: 'Strength & Bodybuilding',
    bio: 'Competition-level bodybuilder with expertise in muscle building and strength programming.',
  },
  {
    name: 'COACH FUNKE',
    specialty: 'Cardio & Dance Fitness',
    bio: 'Energetic instructor who makes every workout feel like a party. Specializes in spin and aerobics.',
  },
];

export default function Trainers() {
  return (
    <section id="trainers" className="py-16 md:py-24 lg:py-32">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <span className="inline-block bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)] px-3 md:px-4 py-2 text-[0.7rem] md:text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#6366F1] mb-4 md:mb-6">
            Meet The Team
          </span>
          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-3 md:mb-4">
            EXPERT TRAINERS AT YOUR SERVICE
          </h2>
          <p className="text-[#A0A0A0] text-base md:text-[1.1rem]">
            Our certified professionals are dedicated to helping you achieve your fitness goals.
          </p>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {trainers.map((trainer, index) => (
            <div
              key={index}
              className="bg-[#141414] border border-white/5 overflow-hidden transition-all duration-400 hover:border-[rgba(99,102,241,0.3)] hover:-translate-y-[10px]"
            >
              {/* Image */}
              <div className="w-full aspect-square bg-gradient-to-br from-[#1E1E1E] to-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
                <FontAwesomeIcon icon={faUser} className="text-5xl md:text-6xl lg:text-7xl opacity-20 text-[#A0A0A0]" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#141414] to-transparent" />
              </div>

              {/* Info */}
              <div className="p-4 md:p-5 lg:p-6">
                <h3 className="font-['Bebas_Neue'] text-xl md:text-2xl lg:text-[1.5rem] tracking-[0.05em] mb-1">
                  {trainer.name}
                </h3>
                <p className="text-[#6366F1] text-[0.75rem] md:text-[0.85rem] uppercase tracking-[0.1em] mb-2 md:mb-3">
                  {trainer.specialty}
                </p>
                <p className="text-[#A0A0A0] text-sm md:text-[0.9rem]">
                  {trainer.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
