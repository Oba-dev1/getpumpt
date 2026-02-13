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
        monday: { open: '06:00', close: '22:00' },
        tuesday: { open: '06:00', close: '22:00' },
        wednesday: { open: '06:00', close: '22:00' },
        thursday: { open: '06:00', close: '22:00' },
        friday: { open: '06:00', close: '22:00' },
        saturday: { open: '07:00', close: '20:00' },
        sunday: { open: '08:00', close: '18:00' },
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
  const adminUser = await prisma.user.upsert({
    where: { gymId_email: { gymId: fitgym.id, email: 'admin@fitstudio.ng' } },
    update: {},
    create: {
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
  const memberUser = await prisma.user.upsert({
    where: { gymId_email: { gymId: fitgym.id, email: 'member@test.com' } },
    update: {},
    create: {
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
  const staffUser = await prisma.user.upsert({
    where: { gymId_email: { gymId: fitgym.id, email: 'staff@fitstudio.ng' } },
    update: {},
    create: {
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

  // Create membership plans for FitGym
  const basicPlan = await prisma.membershipPlan.upsert({
    where: { gymId_name: { gymId: fitgym.id, name: 'Basic' } },
    update: {},
    create: {
      gymId: fitgym.id,
      name: 'Basic',
      description: 'Perfect for getting started on your fitness journey',
      price: 25000,
      currency: 'NGN',
      billingCycle: 'MONTHLY',
      durationValue: 1,
      durationType: 'MONTHS',
      classCredits: 8,
      features: [
        'Access to gym floor',
        'Basic equipment usage',
        'Locker room access',
        '2 group classes/week',
        'Fitness assessment',
      ],
      isActive: true,
      isFeatured: false,
      sortOrder: 1,
    },
  });

  const premiumPlan = await prisma.membershipPlan.upsert({
    where: { gymId_name: { gymId: fitgym.id, name: 'Premium' } },
    update: {},
    create: {
      gymId: fitgym.id,
      name: 'Premium',
      description: 'Our most popular choice for serious fitness enthusiasts',
      price: 45000,
      currency: 'NGN',
      billingCycle: 'MONTHLY',
      durationValue: 1,
      durationType: 'MONTHS',
      classCredits: 20,
      features: [
        'Full gym access 24/7',
        'All equipment & classes',
        'Personal training (2x/month)',
        'Nutrition consultation',
        'Sauna & spa access',
        'Guest passes (2/month)',
      ],
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
    },
  });

  const vipPlan = await prisma.membershipPlan.upsert({
    where: { gymId_name: { gymId: fitgym.id, name: 'VIP' } },
    update: {},
    create: {
      gymId: fitgym.id,
      name: 'VIP',
      description: 'The ultimate experience for dedicated athletes',
      price: 75000,
      currency: 'NGN',
      billingCycle: 'MONTHLY',
      durationValue: 1,
      durationType: 'MONTHS',
      features: [
        'Everything in Premium',
        'Unlimited personal training',
        'Priority class booking',
        'Private locker',
        'Complimentary supplements',
        'Unlimited guest passes',
      ],
      isActive: true,
      isFeatured: false,
      sortOrder: 3,
    },
  });

  console.log(`✅ Created ${3} membership plans`);

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
