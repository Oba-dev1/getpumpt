import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create FitStudio (first tenant)
  const fitgym = await prisma.gym.upsert({
    where: { slug: 'fitstudio' },
    update: {},
    create: {
      name: 'FitStudio',
      slug: 'fitstudio',
      customDomain: 'fitstudio.ng',
      logo: '/FitStudio.png',
      primaryColor: '#6366F1',
      secondaryColor: '#818CF8',
      description: 'Transform Your Body, Elevate Your Life. Join the most advanced fitness facility in Abuja.',
      tagline: 'Transform Your Body, Elevate Your Life',
      address: 'RiverPark Estate',
      city: 'Abuja',
      state: 'FCT',
      country: 'Nigeria',
      phone: '+234 800 000 0000',
      email: 'info@fitstudio.ng',
      website: 'https://fitstudio.ng',
      instagram: 'https://instagram.com/fitstudio',
      twitter: 'https://twitter.com/fitstudio',
      facebook: 'https://facebook.com/fitstudio',
      youtube: 'https://youtube.com/fitstudio',
      metaTitle: 'FitStudio | Transform Your Body, Elevate Your Life',
      metaDescription: 'Join the most advanced fitness facility in Abuja. State-of-the-art equipment, world-class trainers, and a community that pushes you to achieve your best.',
      metaKeywords: ['gym', 'fitness', 'Abuja', 'Nigeria', 'personal training', 'workout', 'health'],
      businessHours: {
        monday: { open: '00:00', close: '23:59' },
        tuesday: { open: '00:00', close: '23:59' },
        wednesday: { open: '00:00', close: '23:59' },
        thursday: { open: '00:00', close: '23:59' },
        friday: { open: '00:00', close: '23:59' },
        saturday: { open: '00:00', close: '23:59' },
        sunday: { closed: true },
      },
      heroContent: {
        badge: 'Now Open in RiverPark Estate Abuja',
        title: 'TRANSFORM YOUR BODY, ELEVATE YOUR LIFE',
        subtitle: 'Join the most advanced fitness facility in Abuja. State-of-the-art equipment, world-class trainers, and a community that pushes you to achieve your best.',
        ctaText: 'Start Your Journey',
        ctaLink: '#pricing',
        secondaryCtaText: 'View Classes',
        secondaryCtaLink: '#schedule',
        backgroundImage: 'https://res.cloudinary.com/dws3lnn4d/image/upload/v1767215000/woman-training-weightlifting-gym_rlaviu.jpg',
        stats: [
          { value: '500+', label: 'Members' },
          { value: '15+', label: 'Trainers' },
          { value: '50+', label: 'Classes/Week' },
        ],
      },
      features: [
        {
          icon: 'faDumbbell',
          title: 'PREMIUM EQUIPMENT',
          description: 'State-of-the-art machines and free weights from top brands. Everything maintained to perfection for your optimal workout.',
        },
        {
          icon: 'faUsers',
          title: 'EXPERT TRAINERS',
          description: 'Certified professionals who create personalized programs tailored to your goals, fitness level, and schedule.',
        },
        {
          icon: 'faMobileScreen',
          title: 'SMART TRACKING',
          description: 'Our digital platform tracks your progress, schedules classes, and keeps you motivated with insights and achievements.',
        },
        {
          icon: 'faAppleWhole',
          title: 'NUTRITION GUIDANCE',
          description: 'Complementary nutrition consultations to optimize your diet and accelerate your fitness results.',
        },
        {
          icon: 'faShower',
          title: 'LUXURY AMENITIES',
          description: 'Clean locker rooms, hot showers, sauna, and a relaxation lounge. Refresh and recover in comfort.',
        },
        {
          icon: 'faClock',
          title: '24/7 ACCESS',
          description: 'Work out on your schedule. Premium members enjoy round-the-clock access to all facilities.',
        },
      ],
      aboutContent: {
        title: 'More Than Just a Gym',
        description: 'Since 2024, FitStudio has been Abuja\'s premier fitness destination. We combine world-class facilities with expert guidance and a supportive community to help you achieve your goals. Whether you\'re a beginner or a seasoned athlete, we have everything you need to succeed.',
        stats: [
          { value: '2+', label: 'Years Experience' },
          { value: '98%', label: 'Member Satisfaction' },
          { value: '24/7', label: 'Access' },
        ],
      },
      settings: {
        timezone: 'Africa/Lagos',
        currency: 'NGN',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h',
        allowOnlineBooking: true,
        allowOnlinePayment: true,
        requireEmailVerification: true,
        maxBookingsPerDay: 3,
      },
      heroImageUrl: 'https://res.cloudinary.com/dws3lnn4d/image/upload/v1767215000/woman-training-weightlifting-gym_rlaviu.jpg',
      aboutImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200',
      videoUrl: null,
      galleryImages: [
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
        'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800',
        'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800',
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800',
        'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=800',
        'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=800',
      ],
    },
  });

  console.log(`✅ Created gym: ${fitgym.name} (${fitgym.slug})`);

  // Create admin user for FitStudio
  const adminPwd = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
  const adminPassword = await bcrypt.hash(adminPwd, 10);
  const adminUser = await prisma.user.findFirst({ where: { gymId: fitgym.id, email: 'admin@fitstudio.ng' } })
    ?? await prisma.user.create({
      data: {
        gymId: fitgym.id,
        email: 'admin@fitstudio.ng',
        passwordHash: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        status: 'ACTIVE',
        phone: '+234 800 000 0001',
      },
    });

  console.log(`Created admin user: ${adminUser.email} (password: ${adminPwd})`);

  // Create a test member user
  const memberPwd = process.env.SEED_MEMBER_PASSWORD || crypto.randomBytes(16).toString('hex');
  const memberPassword = await bcrypt.hash(memberPwd, 10);
  const memberUser = await prisma.user.findFirst({ where: { gymId: fitgym.id, email: 'member@test.com' } })
    ?? await prisma.user.create({
      data: {
        gymId: fitgym.id,
        email: 'member@test.com',
        passwordHash: memberPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: 'MEMBER',
        status: 'ACTIVE',
        phone: '+234 800 000 0002',
      },
    });

  console.log(`Created test member: ${memberUser.email} (password: ${memberPwd})`);

  // Create a staff user (front desk)
  const staffPwd = process.env.SEED_STAFF_PASSWORD || crypto.randomBytes(16).toString('hex');
  const staffPassword = await bcrypt.hash(staffPwd, 10);
  const staffUser = await prisma.user.findFirst({ where: { gymId: fitgym.id, email: 'staff@fitstudio.ng' } })
    ?? await prisma.user.create({
      data: {
        gymId: fitgym.id,
        email: 'staff@fitstudio.ng',
        passwordHash: staffPassword,
        firstName: 'Front Desk',
        lastName: 'Staff',
        role: 'STAFF',
        status: 'ACTIVE',
        phone: '+234 800 000 0003',
      },
    });

  console.log(`Created staff user: ${staffUser.email} (password: ${staffPwd})`);

  // Create membership plans for FitStudio
  const membershipPlans = [
    // Individual plans
    {
      name: 'Individual - Daily',
      description: 'Single day gym access',
      price: 5000,
      billingCycle: 'DAILY' as const,
      durationValue: 1,
      durationType: 'DAYS' as const,
      isFeatured: false,
      sortOrder: 1,
    },
    {
      name: 'Individual - Weekly',
      description: 'One week of unlimited gym access',
      price: 10000,
      billingCycle: 'WEEKLY' as const,
      durationValue: 7,
      durationType: 'DAYS' as const,
      isFeatured: false,
      sortOrder: 2,
    },
    {
      name: 'Individual - 2 Weeks',
      description: 'Two weeks of unlimited gym access',
      price: 20000,
      billingCycle: 'BIWEEKLY' as const,
      durationValue: 14,
      durationType: 'DAYS' as const,
      isFeatured: false,
      sortOrder: 3,
    },
    {
      name: 'Individual - Monthly',
      description: 'Full month of unlimited gym access',
      price: 40000,
      billingCycle: 'MONTHLY' as const,
      durationValue: 1,
      durationType: 'MONTHS' as const,
      isFeatured: true,
      sortOrder: 4,
    },
    {
      name: 'Individual - 3 Months',
      description: '3-month membership with savings',
      price: 110000,
      billingCycle: 'QUARTERLY' as const,
      durationValue: 3,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 5,
    },
    {
      name: 'Individual - 6 Months',
      description: '6-month membership with greater savings',
      price: 198000,
      billingCycle: 'BIANNUAL' as const,
      durationValue: 6,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 6,
    },
    {
      name: 'Individual - 12 Months',
      description: 'Full year membership — best value for individuals',
      price: 360000,
      billingCycle: 'YEARLY' as const,
      durationValue: 12,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 7,
    },
    // Couples plans
    {
      name: 'Couples - Monthly',
      description: 'Monthly membership for two people',
      price: 70000,
      billingCycle: 'MONTHLY' as const,
      durationValue: 1,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 8,
    },
    {
      name: 'Couples - 3 Months',
      description: '3-month membership for two people',
      price: 200000,
      billingCycle: 'QUARTERLY' as const,
      durationValue: 3,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 9,
    },
    {
      name: 'Couples - 6 Months',
      description: '6-month membership for two people',
      price: 400000,
      billingCycle: 'BIANNUAL' as const,
      durationValue: 6,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 10,
    },
    {
      name: 'Couples - 12 Months',
      description: 'Full year membership for two people',
      price: 700000,
      billingCycle: 'YEARLY' as const,
      durationValue: 12,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 11,
    },
    // Family (4) plans
    {
      name: 'Family (4) - Monthly',
      description: 'Monthly membership for a family of four',
      price: 140000,
      billingCycle: 'MONTHLY' as const,
      durationValue: 1,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 12,
    },
    {
      name: 'Family (4) - 3 Months',
      description: '3-month membership for a family of four',
      price: 400000,
      billingCycle: 'QUARTERLY' as const,
      durationValue: 3,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 13,
    },
    {
      name: 'Family (4) - 6 Months',
      description: '6-month membership for a family of four',
      price: 730000,
      billingCycle: 'BIANNUAL' as const,
      durationValue: 6,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 14,
    },
    // Family (5) plans
    {
      name: 'Family (5) - Monthly',
      description: 'Monthly membership for a family of five',
      price: 175000,
      billingCycle: 'MONTHLY' as const,
      durationValue: 1,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 15,
    },
    {
      name: 'Family (5) - 3 Months',
      description: '3-month membership for a family of five',
      price: 500000,
      billingCycle: 'QUARTERLY' as const,
      durationValue: 3,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 16,
    },
    {
      name: 'Family (5) - 6 Months',
      description: '6-month membership for a family of five',
      price: 900000,
      billingCycle: 'BIANNUAL' as const,
      durationValue: 6,
      durationType: 'MONTHS' as const,
      isFeatured: false,
      sortOrder: 17,
    },
  ];

  const standardFeatures = [
    'Full gym floor access',
    'All equipment usage',
    'Locker room access',
    'Group classes access',
  ];

  for (const plan of membershipPlans) {
    await prisma.membershipPlan.upsert({
      where: { gymId_name: { gymId: fitgym.id, name: plan.name } },
      update: {},
      create: {
        gymId: fitgym.id,
        currency: 'NGN',
        features: standardFeatures,
        isActive: true,
        ...plan,
      },
    });
  }

  console.log(`✅ Created ${membershipPlans.length} membership plans`);

  // Create trainers for FitGym
  const trainers = [
    {
      firstName: 'Chidi',
      lastName: 'Okonkwo',
      email: 'chidi@fitstudio.ng',
      bio: 'Certified personal trainer with 8+ years of experience specializing in strength training and body transformation.',
      specialties: ['Strength Training', 'Body Building', 'Weight Loss'],
      certifications: ['NASM-CPT', 'CrossFit L2'],
      yearsExperience: 8,
      imageUrl: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400',
      sortOrder: 1,
    },
    {
      firstName: 'Amara',
      lastName: 'Eze',
      email: 'amara@fitstudio.ng',
      bio: 'Yoga and Pilates instructor passionate about helping clients achieve mind-body balance.',
      specialties: ['Yoga', 'Pilates', 'Flexibility'],
      certifications: ['RYT-500', 'Pilates Certified'],
      yearsExperience: 6,
      imageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400',
      sortOrder: 2,
    },
    {
      firstName: 'Emeka',
      lastName: 'Nwachukwu',
      email: 'emeka@fitstudio.ng',
      bio: 'HIIT and cardio specialist dedicated to pushing you beyond your limits.',
      specialties: ['HIIT', 'Cardio', 'Endurance'],
      certifications: ['ACE-CPT', 'Spinning Certified'],
      yearsExperience: 5,
      imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400',
      sortOrder: 3,
    },
    {
      firstName: 'Ngozi',
      lastName: 'Adeyemi',
      email: 'ngozi@fitstudio.ng',
      bio: 'Boxing and self-defense coach empowering clients through combat fitness.',
      specialties: ['Boxing', 'Kickboxing', 'Self-Defense'],
      certifications: ['USA Boxing Coach', 'First Aid Certified'],
      yearsExperience: 7,
      imageUrl: 'https://images.unsplash.com/photo-1609899464926-209bc98fc65e?w=400',
      sortOrder: 4,
    },
  ];

  for (const trainer of trainers) {
    await prisma.trainer.upsert({
      where: { gymId_email: { gymId: fitgym.id, email: trainer.email } },
      update: {},
      create: {
        gymId: fitgym.id,
        ...trainer,
      },
    });
  }

  console.log(`✅ Created ${trainers.length} trainers`);

  // Create testimonials for FitGym
  const testimonials = [
    {
      name: 'Adaeze O.',
      role: 'Premium Member',
      content: "FitStudio completely transformed my approach to fitness. The trainers are incredibly knowledgeable and the facilities are top-notch. I've lost 15kg in 6 months!",
      rating: 5,
      sortOrder: 1,
    },
    {
      name: 'Chukwuma E.',
      role: 'VIP Member',
      content: "The 24/7 access is a game-changer for my busy schedule. I can work out at 5 AM before work or late at night. Best investment I've made in my health.",
      rating: 5,
      sortOrder: 2,
    },
    {
      name: 'Aisha M.',
      role: 'Basic Member',
      content: "Started as a complete beginner and the staff made me feel so welcome. The group classes are fun and motivating. Already seeing results after just 2 months!",
      rating: 5,
      sortOrder: 3,
    },
  ];

  for (const testimonial of testimonials) {
    await prisma.testimonial.upsert({
      where: {
        id: `${fitgym.id}-${testimonial.name.replace(/\s/g, '-').toLowerCase()}`,
      },
      update: {},
      create: {
        id: `${fitgym.id}-${testimonial.name.replace(/\s/g, '-').toLowerCase()}`,
        gymId: fitgym.id,
        ...testimonial,
        isActive: true,
        isFeatured: true,
      },
    });
  }

  console.log(`✅ Created ${testimonials.length} testimonials`);

  // Create gym classes
  const gymClasses = [
    { name: 'HIIT Blast', category: 'HIIT', duration: 45, capacity: 20, description: 'High-intensity interval training to maximize calorie burn' },
    { name: 'Power Yoga', category: 'YOGA', duration: 60, capacity: 15, description: 'Strengthen and stretch with power yoga flows' },
    { name: 'Spin Class', category: 'SPIN', duration: 45, capacity: 25, description: 'Indoor cycling for cardio endurance' },
    { name: 'Strength 101', category: 'STRENGTH', duration: 50, capacity: 12, description: 'Fundamentals of strength training' },
    { name: 'Boxing Basics', category: 'BOXING', duration: 60, capacity: 16, description: 'Learn boxing techniques while getting fit' },
    { name: 'CrossFit WOD', category: 'CROSSFIT', duration: 60, capacity: 15, description: 'Workout of the day CrossFit style' },
  ];

  for (const gymClass of gymClasses) {
    await prisma.gymClass.upsert({
      where: { gymId_name: { gymId: fitgym.id, name: gymClass.name } },
      update: {},
      create: {
        gymId: fitgym.id,
        name: gymClass.name,
        category: gymClass.category as any,
        duration: gymClass.duration,
        capacity: gymClass.capacity,
        description: gymClass.description,
        isActive: true,
      },
    });
  }

  console.log(`✅ Created ${gymClasses.length} gym classes`);

  // Fetch created gym classes and trainers for schedule creation
  const createdClasses = await prisma.gymClass.findMany({
    where: { gymId: fitgym.id },
  });
  const createdTrainers = await prisma.trainer.findMany({
    where: { gymId: fitgym.id },
  });

  const classByName = (name: string) =>
    createdClasses.find((c) => c.name === name)!;
  const trainerByLastName = (lastName: string) =>
    createdTrainers.find((t) => t.lastName === lastName)!;

  // Create class schedules
  const classSchedules = [
    {
      classId: classByName('HIIT Blast').id,
      trainerId: trainerByLastName('Okonkwo').id,
      dayOfWeek: 'MONDAY' as const,
      startTime: '06:00',
      endTime: '06:45',
      maxCapacity: 20,
      location: 'Studio A',
    },
    {
      classId: classByName('HIIT Blast').id,
      trainerId: trainerByLastName('Okonkwo').id,
      dayOfWeek: 'WEDNESDAY' as const,
      startTime: '06:00',
      endTime: '06:45',
      maxCapacity: 20,
      location: 'Studio A',
    },
    {
      classId: classByName('HIIT Blast').id,
      trainerId: trainerByLastName('Okonkwo').id,
      dayOfWeek: 'FRIDAY' as const,
      startTime: '06:00',
      endTime: '06:45',
      maxCapacity: 20,
      location: 'Studio A',
    },
    {
      classId: classByName('Power Yoga').id,
      trainerId: trainerByLastName('Eze').id,
      dayOfWeek: 'TUESDAY' as const,
      startTime: '07:00',
      endTime: '08:00',
      maxCapacity: 15,
      location: 'Studio B',
    },
    {
      classId: classByName('Power Yoga').id,
      trainerId: trainerByLastName('Eze').id,
      dayOfWeek: 'THURSDAY' as const,
      startTime: '07:00',
      endTime: '08:00',
      maxCapacity: 15,
      location: 'Studio B',
    },
    {
      classId: classByName('Power Yoga').id,
      trainerId: trainerByLastName('Eze').id,
      dayOfWeek: 'SATURDAY' as const,
      startTime: '09:00',
      endTime: '10:00',
      maxCapacity: 15,
      location: 'Studio B',
    },
    {
      classId: classByName('Spin Class').id,
      trainerId: trainerByLastName('Nwachukwu').id,
      dayOfWeek: 'MONDAY' as const,
      startTime: '17:00',
      endTime: '17:45',
      maxCapacity: 25,
      location: 'Spin Room',
    },
    {
      classId: classByName('Spin Class').id,
      trainerId: trainerByLastName('Nwachukwu').id,
      dayOfWeek: 'WEDNESDAY' as const,
      startTime: '17:00',
      endTime: '17:45',
      maxCapacity: 25,
      location: 'Spin Room',
    },
    {
      classId: classByName('Spin Class').id,
      trainerId: trainerByLastName('Nwachukwu').id,
      dayOfWeek: 'FRIDAY' as const,
      startTime: '17:00',
      endTime: '17:45',
      maxCapacity: 25,
      location: 'Spin Room',
    },
    {
      classId: classByName('Strength 101').id,
      trainerId: trainerByLastName('Okonkwo').id,
      dayOfWeek: 'TUESDAY' as const,
      startTime: '18:00',
      endTime: '18:50',
      maxCapacity: 12,
      location: 'Weight Room',
    },
    {
      classId: classByName('Strength 101').id,
      trainerId: trainerByLastName('Okonkwo').id,
      dayOfWeek: 'THURSDAY' as const,
      startTime: '18:00',
      endTime: '18:50',
      maxCapacity: 12,
      location: 'Weight Room',
    },
    {
      classId: classByName('Boxing Basics').id,
      trainerId: trainerByLastName('Nwachukwu').id,
      dayOfWeek: 'MONDAY' as const,
      startTime: '08:00',
      endTime: '09:00',
      maxCapacity: 16,
      location: 'Boxing Ring',
    },
    {
      classId: classByName('Boxing Basics').id,
      trainerId: trainerByLastName('Nwachukwu').id,
      dayOfWeek: 'WEDNESDAY' as const,
      startTime: '08:00',
      endTime: '09:00',
      maxCapacity: 16,
      location: 'Boxing Ring',
    },
    {
      classId: classByName('Boxing Basics').id,
      trainerId: trainerByLastName('Nwachukwu').id,
      dayOfWeek: 'SATURDAY' as const,
      startTime: '10:00',
      endTime: '11:00',
      maxCapacity: 16,
      location: 'Boxing Ring',
    },
    {
      classId: classByName('CrossFit WOD').id,
      trainerId: trainerByLastName('Adeyemi').id,
      dayOfWeek: 'MONDAY' as const,
      startTime: '07:00',
      endTime: '08:00',
      maxCapacity: 15,
      location: 'CrossFit Box',
    },
    {
      classId: classByName('CrossFit WOD').id,
      trainerId: trainerByLastName('Adeyemi').id,
      dayOfWeek: 'WEDNESDAY' as const,
      startTime: '07:00',
      endTime: '08:00',
      maxCapacity: 15,
      location: 'CrossFit Box',
    },
    {
      classId: classByName('CrossFit WOD').id,
      trainerId: trainerByLastName('Adeyemi').id,
      dayOfWeek: 'FRIDAY' as const,
      startTime: '07:00',
      endTime: '08:00',
      maxCapacity: 15,
      location: 'CrossFit Box',
    },
    {
      classId: classByName('CrossFit WOD').id,
      trainerId: trainerByLastName('Adeyemi').id,
      dayOfWeek: 'SATURDAY' as const,
      startTime: '08:00',
      endTime: '09:00',
      maxCapacity: 15,
      location: 'CrossFit Box',
    },
  ];

  for (const schedule of classSchedules) {
    await prisma.classSchedule.create({
      data: {
        gymId: fitgym.id,
        ...schedule,
        isActive: true,
      },
    });
  }

  console.log(`✅ Created ${classSchedules.length} class schedules`);

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
