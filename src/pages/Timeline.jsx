import { useState } from 'react';
import { RiBookLine, RiSearchLine } from 'react-icons/ri';
import { GiLotus, GiPeaceDove, GiMusicalNotes, GiIndianPalace } from 'react-icons/gi';

export default function CulturalInsights() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All', icon: GiLotus },
    { id: 'mythology', name: 'Mythology', icon: GiIndianPalace },
    { id: 'mudras', name: 'Mudras', icon: GiPeaceDove },
    { id: 'music', name: 'Music & Rhythm', icon: GiMusicalNotes },
  ];

  const insights = [
    {
      id: 1,
      title: "The Story of Nataraja",
      description: "Explore the cosmic dance of Lord Shiva and its profound symbolism in Indian classical dance.",
      category: "mythology",
      readTime: "10 min",
      image: "/images/nataraja.jpg",
      featured: true
    },
    {
      id: 2,
      title: "Understanding Hasta Mudras",
      description: "Learn the intricate hand gestures that form the language of Indian classical dance.",
      category: "mudras",
      readTime: "15 min",
      image: "/images/mudras.jpg"
    },
    {
      id: 3,
      title: "The Navarasas",
      description: "Discover the nine emotions that are fundamental to Indian classical dance and their expressions.",
      category: "mythology",
      readTime: "12 min",
      image: "/images/navarasas.jpg"
    },
    {
      id: 4,
      title: "Understanding Carnatic Music",
      description: "Explore the melodic and rhythmic foundations of South Indian classical music.",
      category: "music",
      readTime: "20 min",
      image: "/images/carnatic.jpg"
    }
  ];

  const filteredInsights = insights.filter(insight => {
    const matchesCategory = selectedCategory === 'all' || insight.category === selectedCategory;
    const matchesSearch = insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredInsight = insights.find(insight => insight.featured);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-orange-900">Cultural Insights</h1>
          <p className="text-orange-700 mt-1">Explore the rich heritage of Indian classical dance</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search insights..."
            className="input input-bordered w-64 pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600" />
        </div>
      </div>

      {/* Featured Story */}
      {featuredInsight && (
        <div className="card bg-gradient-to-r from-orange-100 to-pink-100 shadow-xl">
          <div className="card-body">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h2 className="card-title text-2xl text-orange-900 mb-3">{featuredInsight.title}</h2>
                <p className="text-orange-800 mb-4">{featuredInsight.description}</p>
                <div className="flex items-center gap-4">
                  <button className="btn bg-orange-600 hover:bg-orange-700 text-white border-none">
                    Read Story
                  </button>
                  <button className="btn btn-outline border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white">
                    Watch Video
                  </button>
                </div>
              </div>
              <div className="w-64 h-64 bg-orange-200 rounded-lg">
                {/* Placeholder for featured image */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`btn btn-lg gap-2 ${
              selectedCategory === category.id
                ? 'bg-orange-100 text-orange-900 border-orange-200'
                : 'bg-white text-orange-800 border-orange-100 hover:bg-orange-50'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <category.icon className="w-5 h-5" />
            {category.name}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInsights.map((insight) => (
          <div key={insight.id} className="card bg-white shadow-lg hover:shadow-xl transition-shadow">
            <div className="aspect-video bg-orange-100 rounded-t-lg">
              {/* Placeholder for insight image */}
            </div>
            <div className="card-body">
              <div className="flex items-start justify-between">
                <h3 className="card-title text-orange-900">{insight.title}</h3>
                <span className="badge bg-orange-100 text-orange-700 border-none">
                  {categories.find(c => c.id === insight.category)?.name}
                </span>
              </div>
              <p className="text-orange-700 mt-2">{insight.description}</p>
              <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <RiBookLine className="w-4 h-4" />
                  <span className="text-sm">{insight.readTime} read</span>
                </div>
                <button className="btn btn-sm btn-ghost text-orange-600 hover:bg-orange-50">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-orange-900">
              <GiPeaceDove className="text-orange-600" />
              Interactive Mudra Guide
            </h2>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i}
                  className="aspect-square bg-orange-50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-orange-100 transition-colors"
                >
                  <GiPeaceDove className="w-8 h-8 text-orange-600" />
                </div>
              ))}
            </div>
            <p className="text-sm text-orange-700 mt-4">
              Click on any mudra to learn its meaning and usage in dance
            </p>
          </div>
        </div>

        <div className="card bg-white shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-orange-900">
              <GiMusicalNotes className="text-orange-600" />
              Tala Patterns
            </h2>
            <div className="space-y-4 mt-4">
              {[
                { name: 'Adi Talam', beats: '8 beats' },
                { name: 'Rupaka Talam', beats: '6 beats' },
                { name: 'Khanda Chapu', beats: '5 beats' }
              ].map((tala, index) => (
                <div 
                  key={index}
                  className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-orange-900">{tala.name}</span>
                    <span className="text-sm text-orange-700">{tala.beats}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 