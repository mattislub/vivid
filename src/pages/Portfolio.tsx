import React, { useState } from 'react';
import { ExternalLink, Github, ArrowRight, Filter } from 'lucide-react';

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const projects = [
    {
      id: 1,
      title: 'Global Brand Campaign',
      category: 'branding',
      description: 'Complete brand identity and multi-channel campaign for international tech startup',
      image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600',
      tags: ['Brand Strategy', 'Visual Identity', 'Campaign Management'],
      link: '#',
      github: '#'
    },
    {
      id: 2,
      title: 'Social Media Strategy',
      category: 'social',
      description: 'Comprehensive social media campaign that increased engagement by 300%',
      image: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=600',
      tags: ['Social Media', 'Content Creation', 'Analytics'],
      link: '#',
      github: '#'
    },
    {
      id: 3,
      title: 'Product Launch Campaign',
      category: 'campaigns',
      description: 'Integrated marketing campaign for major product launch with 500% ROI',
      image: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600',
      tags: ['Product Launch', 'PR', 'Digital Advertising'],
      link: '#',
      github: '#'
    },
    {
      id: 4,
      title: 'Google Ads Optimization',
      category: 'digital',
      description: 'PPC campaign optimization that reduced cost-per-click by 40% while doubling conversions',
      image: 'https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=600',
      tags: ['Google Ads', 'PPC', 'Conversion Optimization'],
      link: '#',
      github: '#'
    },
    {
      id: 5,
      title: 'Influencer Marketing',
      category: 'social',
      description: 'Strategic influencer partnerships that generated 2M+ impressions and 15% sales increase',
      image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=600',
      tags: ['Influencer Marketing', 'Partnership Management', 'ROI Tracking'],
      link: '#',
      github: '#'
    },
    {
      id: 6,
      title: 'Email Marketing Automation',
      category: 'digital',
      description: 'Automated email sequences that increased customer retention by 45%',
      image: 'https://images.pexels.com/photos/270408/pexels-photo-270408.jpeg?auto=compress&cs=tinysrgb&w=600',
      tags: ['Email Marketing', 'Automation', 'Customer Retention'],
      link: '#',
      github: '#'
    },
    {
      id: 7,
      title: 'Video Marketing Campaign',
      category: 'content',
      description: 'Viral video series that reached 5M+ views and increased brand awareness by 200%',
      image: 'https://images.pexels.com/photos/3153198/pexels-photo-3153198.jpeg?auto=compress&cs=tinysrgb&w=600',
      tags: ['Video Production', 'Viral Marketing', 'Brand Awareness'],
      link: '#',
      github: '#'
    },
    {
      id: 8,
      title: 'SEO & Content Strategy',
      category: 'digital',
      description: 'Comprehensive SEO strategy that improved organic traffic by 250% in 6 months',
      image: 'https://images.pexels.com/photos/270637/pexels-photo-270637.jpeg?auto=compress&cs=tinysrgb&w=600',
      tags: ['SEO', 'Content Strategy', 'Organic Growth'],
      link: '#',
      github: '#'
    },
    {
      id: 9,
      title: 'Event Marketing',
      category: 'campaigns',
      description: 'Large-scale event promotion that sold out 5,000 tickets in 48 hours',
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600',
      tags: ['Event Marketing', 'Ticket Sales', 'Promotion Strategy'],
      link: '#',
      github: '#'
    }
  ];

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'branding', label: 'Branding & Identity' },
    { id: 'digital', label: 'Digital Marketing' },
    { id: 'social', label: 'Social Media' },
    { id: 'campaigns', label: 'Campaign Management' },
    { id: 'content', label: 'Content Marketing' }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-chewy text-white mb-6">
            <span className="text-white">Our</span> Success Stories
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Explore our award-winning campaigns and marketing strategies that drive real results
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center space-x-2 text-slate-300 mb-4">
            <Filter size={20} className="animate-pulse" style={{animationDuration: '2s'}} />
            <span className="font-medium">Filter by category:</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-white'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700 hover:border-white/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
              style={{ 
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Project Links */}
                <div className="absolute top-4 right-4 flex space-x-2 rtl:space-x-reverse opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <a
                    href={project.link}
                    className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white hover:text-slate-900 transition-all duration-300 hover:scale-110 hover:rotate-12"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <a
                    href={project.github}
                    className="bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-slate-700 transition-all duration-300 hover:scale-110 hover:rotate-12"
                  >
                    <Github size={16} />
                  </a>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-white transition-colors duration-200">
                  {project.title}
                </h3>
                
                <p className="text-slate-300 mb-4 leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full border border-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button className="group/btn flex items-center space-x-2 rtl:space-x-reverse text-white hover:text-gray-200 font-medium transition-colors duration-200">
                  <span>View Project</span>
                  <ArrowRight 
                    size={16} 
                    className="transform group-hover/btn:translate-x-1 group-hover/btn:scale-110 transition-transform duration-300 animate-pulse" 
                    style={{animationDuration: '3s'}}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-white/10 to-gray-100/10 rounded-2xl p-12 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to grow your business?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Let's create a marketing strategy that drives results and grows your brand
            </p>
            <button className="bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 text-slate-900 font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
              Start Your Campaign
            </button>
          </div>
        </div>
        
        {/* Floating space elements */}
        <div className="fixed top-20 left-10 w-16 h-16 bg-blue-400/10 rounded-full animate-bounce pointer-events-none" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
        <div className="fixed top-40 right-20 w-12 h-12 bg-purple-400/10 rounded-full animate-ping pointer-events-none" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
        <div className="fixed bottom-40 left-20 w-8 h-8 bg-yellow-400/20 rounded-full animate-pulse pointer-events-none" style={{animationDelay: '2s', animationDuration: '2.5s'}}></div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Portfolio;