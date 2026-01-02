import React from 'react';
import Container from '../components/Container';
import { HeartIcon } from '../components/Icons';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-primary text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-10 rounded-full -mr-20 -mt-20"></div>
        <Container className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Empowering Kindness</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto font-medium">
            HeartFund is more than a platform; it's a movement dedicated to turning empathy into measurable impact.
          </p>
        </Container>
      </div>

      <Container className="py-16 md:py-24">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-primary flex items-center gap-2">
              <span className="w-8 h-1 bg-secondary inline-block"></span>
              Our Mission
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              To bridge the gap between global challenges and individual compassion by providing a transparent, secure, and intuitive platform that amplifies the power of every donation. We strive to ensure that no voice goes unheard and no need goes unmet.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-primary flex items-center gap-2">
              <span className="w-8 h-1 bg-accent inline-block"></span>
              Our Vision
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We envision a world where collective action is the standard response to adversity. By leveraging technology for good, HeartFund aims to cultivate a global ecosystem of generosity where trust is paramount and impact is visible.
            </p>
          </div>
        </div>

        {/* Leadership Spotlight */}
      <div className="bg-gray-50 rounded-[3rem] p-10 md:p-16 border border-gray-100 relative mb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-full shadow-lg">
          <HeartIcon className="w-8 h-8 text-secondary" />
        </div>

      <div className="max-w-3xl mx-auto text-center">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-8">
          Leadership Spotlight
        </h3>

      {/* CEO Image */}
      <img
      src="https://media.licdn.com/dms/image/v2/D5603AQEcB24vTTjk-g/profile-displayphoto-scale_200_200/B56Znl3MqvJkAc-/0/1760498083006?e=1769040000&v=beta&t=9zWzqjTw4hr8Q68dWVtizT5GIjTjfUmzJJ2_9vnF07o"
      alt="Velagala Sai Tarun Reddy, Chief Executive Officer of HeartFund"
      className="mx-auto mb-6 w-32 h-32 rounded-full object-cover border-4 border-secondary shadow-md"
      />

      {/* Name & Role */}
      <div className="space-y-1 mb-6">
        <p className="text-2xl font-black text-primary">
          Velagala Sai Tarun Reddy
        </p>
        <p className="text-sm font-bold text-secondary uppercase tracking-widest">
          Chief Executive Officer
        </p>
      </div>

      {/* Quote */}
      <p className="text-xl md:text-2xl font-semibold text-neutral italic leading-snug mb-8">
        “Technology has value only when it is used to uplift people, not replace responsibility.”
      </p>

      {/* Description */}
      <p className="text-gray-500 leading-relaxed font-medium">
        Under the leadership of Velagala Sai Tarun Reddy, HeartFund is driven by a
        clear focus on transparency, accountability, and social impact. His vision
        emphasizes using technology as a tool for trust-building—ensuring that
        every contribution is meaningful, traceable, and directed toward real
        change.
      </p>
    </div>
  </div>

        {/* Core Values */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-neutral">Our Core Values</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { title: 'Transparency', desc: 'Real-time tracking of every dollar to ensure your contribution reaches its destination.' },
            { title: 'Community', desc: 'Building lasting bonds between donors and creators based on shared hope.' },
            { title: 'Integrity', desc: 'Rigorous verification processes to maintain the highest standards of trust.' }
          ].map((value, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center">
              <h4 className="text-xl font-bold text-primary mb-3">{value.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">{value.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

export default AboutPage;
