import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faInstagram, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';

const quickLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Membership' },
  { href: '#schedule', label: 'Class Schedule' },
  { href: '#trainers', label: 'Our Trainers' },
  { href: '#contact', label: 'Contact Us' },
];

const programs = [
  { href: '#', label: 'Personal Training' },
  { href: '#', label: 'Group Classes' },
  { href: '#', label: 'Nutrition Plans' },
  { href: '#', label: 'Corporate Wellness' },
  { href: '#', label: 'Online Coaching' },
];

const support = [
  { href: '#', label: 'FAQs' },
  { href: '#', label: 'Help Center' },
  { href: '#', label: 'Membership Terms' },
  { href: '#', label: 'Cancellation Policy' },
  { href: '#', label: 'Careers' },
];

const socialLinks = [
  { href: '#', icon: faFacebookF, label: 'Facebook' },
  { href: '#', icon: faInstagram, label: 'Instagram' },
  { href: '#', icon: faTwitter, label: 'Twitter' },
  { href: '#', icon: faYoutube, label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-[#141414] pt-12 md:pt-16 lg:pt-20 pb-6 md:pb-8">
      <div className="container-custom">
        {/* Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-12 mb-10 md:mb-12 lg:mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 md:mb-6">
              <Image
                src="/Fit Gym.png"
                alt="FIT GYM"
                width={100}
                height={40}
                className="h-10 md:h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-[#A0A0A0] text-sm md:text-[0.95rem] mb-4 md:mb-6">
              Transform your body, elevate your life. Lagos&apos; premier fitness destination offering world-class facilities and expert guidance.
            </p>
            <div className="flex gap-3 md:gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 md:w-10 md:h-10 bg-[#0A0A0A] border border-white/10 flex items-center justify-center text-[#A0A0A0] transition-all duration-300 hover:bg-[#6366F1] hover:border-[#6366F1] hover:text-white text-sm"
                >
                  <FontAwesomeIcon icon={social.icon} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-['Bebas_Neue'] text-lg md:text-xl lg:text-[1.3rem] tracking-[0.05em] mb-4 md:mb-6">
              Quick Links
            </h4>
            <ul className="space-y-2 md:space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-[#A0A0A0] text-sm md:text-[0.95rem] transition-colors duration-300 hover:text-[#6366F1]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-['Bebas_Neue'] text-lg md:text-xl lg:text-[1.3rem] tracking-[0.05em] mb-4 md:mb-6">
              Programs
            </h4>
            <ul className="space-y-2 md:space-y-3">
              {programs.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-[#A0A0A0] text-sm md:text-[0.95rem] transition-colors duration-300 hover:text-[#6366F1]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-['Bebas_Neue'] text-lg md:text-xl lg:text-[1.3rem] tracking-[0.05em] mb-4 md:mb-6">
              Support
            </h4>
            <ul className="space-y-2 md:space-y-3">
              {support.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-[#A0A0A0] text-sm md:text-[0.95rem] transition-colors duration-300 hover:text-[#6366F1]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/5 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <p className="text-[#A0A0A0] text-xs md:text-[0.9rem]">
            © {new Date().getFullYear()} FIT GYM. All rights reserved.
          </p>
          <div className="flex gap-4 md:gap-8">
            <Link href="#" className="text-[#A0A0A0] text-xs md:text-[0.9rem] transition-colors duration-300 hover:text-[#6366F1]">
              Privacy Policy
            </Link>
            <Link href="#" className="text-[#A0A0A0] text-xs md:text-[0.9rem] transition-colors duration-300 hover:text-[#6366F1]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
