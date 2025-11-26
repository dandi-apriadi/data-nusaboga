import React from 'react';
import Testimonials from 'components/homepage/Testimonials.jsx';
import Footer from '../../components/Footer';

const BlogList = () => {
  return (
    <div className="w-full">
      {/* Header */}
      <section className="relative py-14 sm:py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 opacity-20"
             style={{
               backgroundImage:
                 "url(https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea?auto=format&fit=crop&w=1600&q=60)",
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold">Artikel & Blog</h1>
          <p className="mt-2 text-white/90 max-w-2xl text-xs sm:text-sm md:text-base">
            Baca artikel, tips, dan kabar terbaru dari Lyvia Nusa Boga.
          </p>
        </div>
      </section>

      {/* Blog cards grid (reusing Testimonials component) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Testimonials />
      </div>
      <Footer />
    </div>
  );
};

export default BlogList;
