import React, { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import img1 from '../../../src/assets/img/homepage/1.jpeg';
import img2 from '../../../src/assets/img/homepage/2.jpeg';
import img3 from '../../../src/assets/img/homepage/3.jpeg';

import {
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdAccessTime,
  MdSend,
  MdRestaurant,
  MdLocalShipping,
  MdSupport,
  MdWhatsapp,
  MdChat,
  MdSchedule,
  MdVerified,
  MdStar,
  MdTrendingUp,
  MdDirections,
  MdLocalParking,
  MdAccessible,
  MdMap,
  MdLaunch,
  MdGpsFixed,
  MdNavigation,
  MdShoppingCart,
  MdSecurity
} from 'react-icons/md';
import { 
  FiFacebook, 
  FiInstagram, 
  FiMail, 
  FiMapPin, 
  FiClock, 
  FiPhone, 
  FiMail as FiMailAlt,
  FiMessageCircle,
  FiCheck,
  FiArrowRight,
  FiArrowUpRight
} from 'react-icons/fi';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    AOS.init({
      duration: 300,
      once: true,
      easing: 'ease-out',
      disable: isMobile ? 'mobile' : false
    });
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    alert('Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: <FiPhone className="h-6 w-6" />,
      title: "Telepon",
      info: "082297992691",
      subtitle: "Senin - Sabtu, 08:00 - 17:00",
      color: "from-blue-500 to-indigo-600",
      link: "tel:082297992691"
    },
    {
      icon: <FiMailAlt className="h-6 w-6" />,
      title: "Email",
      info: "lyvianusaboga@gmail.com",
      subtitle: "Respon dalam 24 jam",
      color: "from-purple-500 to-pink-600",
      link: "mailto:lyvianusaboga@gmail.com"
    },
    {
      icon: <FiMapPin className="h-6 w-6" />,
      title: "Alamat",
      info: "Jln Gandari V, No 9 GPI Manado",
      subtitle: "Manado, Sulawesi Utara",
      color: "from-green-500 to-green-600",
      link: null
    },
    {
      icon: <FiClock className="h-6 w-6" />,
      title: "Jam Operasional",
      info: "08:00 - 17:00 WIB",
      subtitle: "Senin - Sabtu",
      color: "from-amber-500 to-orange-600",
      link: null
    }
  ];

  const supportOptions = [
    {
      icon: <MdRestaurant className="h-8 w-8" />,
      title: "Konsultasi Produk",
      description: "Butuh rekomendasi produk cakalang yang sesuai selera Anda?",
      action: "Konsultasi Sekarang",
      color: "from-blue-500 to-indigo-600",
      features: ["Rekomendasi Personal", "Expert Advice", "Sample Gratis"]
    },
    {
      icon: <MdLocalShipping className="h-8 w-8" />,
      title: "Informasi Pengiriman",
      description: "Cek status pengiriman atau tanyakan estimasi ongkos kirim",
      action: "Cek Pengiriman",
      color: "from-green-500 to-green-600",
      features: ["Tracking Real-time", "Multiple Kurir", "Asuransi Barang"]
    },
    {
      icon: <MdSupport className="h-8 w-8" />,
      title: "Bantuan Umum",
      description: "Ada pertanyaan, keluhan, atau kendala? Tim kami siap membantu 24/7",
      action: "Hubungi Support",
      color: "from-amber-500 to-orange-600",
      features: ["Support 24/7", "Live Chat", "Garansi Kepuasan"]
    }
  ];

  return (
    <div className="font-sans bg-white overflow-x-hidden">
      {/* Enhanced Simple & Clean Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full blur-2xl"></div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-16 left-16 w-4 h-4 bg-blue-400 rounded-full animate-float opacity-60" style={{animationDelay: '0s', animationDuration: '6s'}}></div>
          <div className="absolute top-32 right-32 w-3 h-3 bg-indigo-400 rounded-full animate-float opacity-50" style={{animationDelay: '1s', animationDuration: '8s'}}></div>
          <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-70" style={{animationDelay: '2s', animationDuration: '7s'}}></div>
          <div className="absolute bottom-16 right-16 w-5 h-5 bg-blue-300 rounded-full animate-float opacity-40" style={{animationDelay: '3s', animationDuration: '9s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-indigo-300 rounded-full animate-float opacity-30" style={{animationDelay: '4s', animationDuration: '10s'}}></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233B82F6' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content Side */}
            <div className="text-center lg:text-left space-y-8">
              {/* Enhanced Badge */}
              <div className="inline-flex items-center bg-white/80 backdrop-blur-sm border border-blue-200/50 text-blue-700 rounded-full px-6 py-3 text-sm font-medium shadow-lg" data-aos="fade-up">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <MdVerified className="mr-2 h-4 w-4" />
                <span>Customer Service Terpercaya</span>
                <div className="w-2 h-2 bg-blue-500 rounded-full ml-3 animate-pulse" style={{animationDelay: '0.5s'}}></div>
              </div>

              {/* Clean Title with Better Spacing */}
              <div className="space-y-6" data-aos="fade-up">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Hubungi <span className="text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">Tim Kami</span>
                </h1>
                
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto lg:mx-0"></div>
                
                <p className="text-xs sm:text-sm md:text-base lg:text-xl text-gray-600 leading-relaxed max-w-lg">
                  Kami siap membantu Anda dengan <span className="font-semibold text-blue-700">pertanyaan</span>, 
                  <span className="font-semibold text-indigo-700"> saran</span>, atau kebutuhan produk cakalang berkualitas premium
                </p>
              </div>

              {/* Enhanced Contact Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" data-aos="fade-up">
                <a
                  href="https://wa.me/6282297992691"
                  className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <MdWhatsapp className="h-4 w-4 sm:h-5 sm:w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                  WhatsApp Langsung
                  <div className="ml-3 w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                </a>
              </div>

              {/* Quick Contact Info */}
              <div className="grid grid-cols-2 gap-4 pt-4" data-aos="fade-up">
                <div className="text-center lg:text-left">
                  <div className="text-xs sm:text-sm font-medium text-gray-500">Response Time</div>
                  <div className="text-xs sm:text-sm md:text-lg font-bold text-blue-600">{'<'} 1 Jam</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-xs sm:text-sm font-medium text-gray-500">Availability</div>
                  <div className="text-xs sm:text-sm md:text-lg font-bold text-green-600">24/7 Online</div>
                </div>
              </div>
            </div>

            {/* Enhanced Visual Side */}
            <div className="relative" data-aos="fade-up">
              {/* Main Illustration Card */}
              <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-500">
                {/* Card Header */}
                <div className="text-center mb-8">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full"></div>
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <img
                        src={img1}
                        alt="Customer Service"
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-200/50"
                      />
                    </div>
                    {/* Status Indicator */}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">
                    Tim Customer Service
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Profesional & Berpengalaman
                  </p>
                </div>

                {/* Enhanced Feature Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="group text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50 hover:border-blue-200/50 transition-all duration-300">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <MdSupport className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-gray-900 mb-1">Support 24/7</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Siap Melayani</div>
                  </div>
                  
                  <div className="group text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100/50 hover:border-green-200/50 transition-all duration-300">
                    <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <MdChat className="h-7 w-7 text-white" />
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-gray-900 mb-1">Live Chat</div>
                    <div className="text-[10px] sm:text-xs text-gray-600">Respon Cepat</div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Online Sekarang
                  </span>
                  <span>⭐ Rating 4.9/5</span>
                </div>
              </div>

              {/* Enhanced Floating Elements */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-white rounded-2xl shadow-xl p-3 hidden lg:block hover:scale-110 transition-transform duration-300">
                <img
                  src={img2}
                  alt="Fish Products"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>

              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-white rounded-2xl shadow-xl p-2 hidden lg:block hover:scale-110 transition-transform duration-300">
                <img
                  src={img3}
                  alt="Quality Assurance"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>

              <div className="absolute top-1/2 -left-8 w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-2 hidden lg:block hover:scale-110 transition-transform duration-300">
                <div className="w-full h-full bg-white/20 rounded-xl flex items-center justify-center">
                  <MdVerified className="h-7 w-7 text-white" />
                </div>
              </div>

              {/* Corner Decorations */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-60"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-50"></div>
            </div>
          </div>

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20" data-aos="fade-up">
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100/50 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MdAccessTime className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-900 font-semibold mb-2">Customer Support</div>
              <div className="text-gray-600 text-sm">Siap melayani kapan saja</div>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto mt-4 rounded-full group-hover:w-16 transition-all duration-300"></div>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100/50 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MdSchedule className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">{"<"}1h</div>
              <div className="text-gray-900 font-semibold mb-2">Response Time</div>
              <div className="text-gray-600 text-sm">Respon cepat terjamin</div>
              <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-green-600 mx-auto mt-4 rounded-full group-hover:w-16 transition-all duration-300"></div>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-100/50 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <MdStar className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-2">99%</div>
              <div className="text-gray-900 font-semibold mb-2">Satisfaction Rate</div>
              <div className="text-gray-600 text-sm">Pelanggan sangat puas</div>
              <div className="w-12 h-1 bg-gradient-to-r from-purple-500 to-purple-600 mx-auto mt-4 rounded-full group-hover:w-16 transition-all duration-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Info Section */}
      <section className="py-24 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-20" data-aos="fade-up">
            <div className="inline-flex items-center bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full px-6 py-3 text-sm font-bold mb-8 shadow-lg">
              <FiMessageCircle className="mr-3 h-5 w-5 animate-pulse" />
              <span>Informasi Kontak</span>
              <div className="ml-3 w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="block" data-aos="fade-right">Berbagai Cara</span>
                <span 
                  className="block text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text" 
                  data-aos="fade-left" 
                 
                >
                  Menghubungi Kami
                </span>
              </h2>
              
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full" data-aos="zoom-in"></div>
              
              <p className="text-xs sm:text-sm md:text-base lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed" data-aos="fade-up">
                Pilih metode komunikasi yang paling <span className="font-semibold text-indigo-700">nyaman</span> untuk Anda. 
                Tim kami siap melayani dengan <span className="font-semibold text-purple-700">responsif dan profesional</span>
              </p>
            </div>
          </div>

          {/* Enhanced Contact Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="group relative flex h-full"
                data-aos="fade-up"
               
              >
                {info.link ? (
                  <a href={info.link} className="block flex-1 h-full">
                    <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 text-center border border-slate-100 hover:border-indigo-200 hover:-translate-y-4 overflow-hidden flex flex-col min-h-[320px] justify-between">
                      {/* Card Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                      
                      <div className="relative z-10">
                        <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${info.color} text-white rounded-3xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-2xl`}>
                          {info.icon}
                        </div>
                        
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-700 transition-colors duration-500">
                          {info.title}
                        </h3>
                        
                        <p className="text-xs sm:text-sm md:text-base text-indigo-600 font-semibold mb-2">{info.info}</p>
                        <p className="text-[10px] sm:text-xs md:text-sm mb-6 text-gray-500">{info.subtitle}</p>

                        {/* Action Indicator */}
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-[10px] sm:text-xs font-semibold text-gray-500">Klik untuk kontak</span>
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${info.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left`}></div>
                        </div>
                      </div>

                      {/* Floating Number Badge */}
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-500">
                        {index + 1}
                      </div>
                    </div>
                  </a>
                ) : (
                  <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 text-center border border-slate-100 hover:border-indigo-200 hover:-translate-y-4 overflow-hidden flex flex-col min-h-[320px] justify-between">
                    {/* Same content as above but without link wrapper */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <div className="relative z-10">
                      <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${info.color} text-white rounded-3xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-2xl`}>
                        {info.icon}
                      </div>
                      
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-4 group-hover:text-indigo-700 transition-colors duration-500">
                        {info.title}
                      </h3>
                      
                        <p className="text-xs sm:text-sm md:text-base text-indigo-600 font-semibold mb-2">{info.info}</p>
                        <p className="text-[10px] sm:text-xs md:text-sm mb-6 text-gray-500">{info.subtitle}</p>

                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] sm:text-xs font-semibold text-gray-500">Jam operasional</span>
                      </div>

                      <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${info.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left`}></div>
                      </div>
                    </div>

                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-500">
                      {index + 1}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Summary */}
          <div className="text-center mt-16" data-aos="fade-up">
            <div className="inline-flex items-center space-x-6 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-2xl p-6 shadow-lg">
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-600">4</div>
                <div className="text-xs sm:text-sm text-gray-600">Cara Kontak</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">24/7</div>
                <div className="text-xs sm:text-sm text-gray-600">Availability</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-pink-600">{"<"}1h</div>
                <div className="text-xs sm:text-sm text-gray-600">Response Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Contact Form Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Enhanced Form */}
            <div data-aos="fade-right">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full px-6 py-3 text-sm font-bold mb-8 shadow-lg">
                <MdSend className="mr-3 h-5 w-5" />
                <span>Kirim Pesan</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Sampaikan 
                <span className="text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text"> Pesan Anda</span>
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Isi formulir di bawah ini dengan detail yang jelas. Tim ahli kami akan merespons 
                pesan Anda dalam waktu kurang dari 1 jam kerja.
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-gray-700 font-semibold mb-3 group-focus-within:text-indigo-600 transition-colors">
                      <FiCheck className="inline h-4 w-4 mr-2" />
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-gray-700 font-semibold mb-3 group-focus-within:text-indigo-600 transition-colors">
                      <FiCheck className="inline h-4 w-4 mr-2" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300"
                      placeholder="nama@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-gray-700 font-semibold mb-3 group-focus-within:text-indigo-600 transition-colors">
                      <FiPhone className="inline h-4 w-4 mr-2" />
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300"
                      placeholder="62 811-488-068"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-gray-700 font-semibold mb-3 group-focus-within:text-indigo-600 transition-colors">
                      <FiCheck className="inline h-4 w-4 mr-2" />
                      Subjek *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300"
                    >
                      <option value="">Pilih subjek</option>
                      <option value="produk">Pertanyaan Produk</option>
                      <option value="pemesanan">Pemesanan</option>
                      <option value="pengiriman">Pengiriman</option>
                      <option value="keluhan">Keluhan</option>
                      <option value="kerjasama">Kerjasama</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-gray-700 font-semibold mb-3 group-focus-within:text-indigo-600 transition-colors">
                    <FiMessageCircle className="inline h-4 w-4 mr-2" />
                    Pesan *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 sm:px-6 sm:py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-300 resize-none hover:border-gray-300"
                    placeholder="Tulis pesan Anda di sini dengan detail yang jelas..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-5 px-8 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center"
                >
                  <MdSend className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  Kirim Pesan Sekarang
                  <FiArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>

                {/* Form Features */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <FiCheck className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Secure</span>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MdSchedule className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Fast Response</span>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <MdVerified className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Verified</span>
                  </div>
                </div>
              </form>
            </div>

            {/* Support Options - Redesigned */}
            <div data-aos="fade-left">
              {/* Section Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FFF5E1] to-[#FFE8D6] border border-[#FFE8D6] rounded-full px-5 py-2 mb-4">
                  <MdSupport className="h-5 w-5 text-[#FF6347]" />
                  <span className="text-sm font-semibold text-gray-700">Bantuan Khusus</span>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Layanan <span className="text-[#FF6347]">Premium</span>
                </h3>
                <p className="text-gray-600">Kami siap membantu kebutuhan Anda dengan layanan terbaik</p>
              </div>
              
              {/* Support Cards */}
              <div className="space-y-4">
                {supportOptions.map((option, index) => (
                  <div
                    key={index}
                    className="group bg-white p-6 rounded-2xl border-2 border-[#FFE8D6] hover:border-[#FF6347] transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-14 h-14 bg-gradient-to-br ${option.color} text-white rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        {option.icon}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {option.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                          {option.description}
                        </p>

                        {/* Features List */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {option.features.map((feature, featureIndex) => (
                            <div 
                              key={featureIndex} 
                              className="inline-flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg text-xs"
                            >
                              <FiCheck className="h-3 w-3 text-green-600 flex-shrink-0" />
                              <span className="text-gray-700 font-medium">{feature}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action Button */}
                        <button className="inline-flex items-center gap-2 text-[#FF6347] font-semibold text-sm hover:gap-3 transition-all duration-300">
                          <span>{option.action}</span>
                          <FiArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Social Media */}
              <div className="mt-12 p-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-3xl border border-indigo-100">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-gray-900">Ikuti Social Media Kami</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Active</span>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <a
                    href="https://web.facebook.com/sambalroamanadolyvia/?_rdc=1&_rdr#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <FiFacebook className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a
                    href="https://www.instagram.com/lyvianusaboga/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl flex items-center justify-center hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <FiInstagram className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a
                    href="mailto:lyvianusaboga@gmail.com"
                    className="group w-14 h-14 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl flex items-center justify-center hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <FiMail className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@lyvianusaboga.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-neutral-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    {/* TikTok Simple Logo, no white bg, no gradient */}
                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform duration-300">
                      <path d="M21.5 6V19.5C21.5 23.09 18.59 26 15 26C11.41 26 8.5 23.09 8.5 19.5C8.5 15.91 11.41 13 15 13C15.8284 13 16.5 13.6716 16.5 14.5V19.5C16.5 20.3284 17.1716 21 18 21C18.8284 21 19.5 20.3284 19.5 19.5V6C19.5 5.17157 20.1716 4.5 21 4.5C21.8284 4.5 22.5 5.17157 22.5 6V19.5C22.5 24.1944 18.6944 28 14 28C9.30558 28 5.5 24.1944 5.5 19.5C5.5 14.8056 9.30558 11 14 11C14.8284 11 15.5 11.6716 15.5 12.5V19.5C15.5 20.3284 16.1716 21 17 21C17.8284 21 18.5 20.3284 18.5 19.5V6C18.5 5.17157 19.1716 4.5 20 4.5C20.8284 4.5 21.5 5.17157 21.5 6Z" fill="#000"/>
                      <circle cx="24" cy="8" r="2" fill="#25F4EE"/>
                      <circle cx="10" cy="24" r="2" fill="#FE2C55"/>
                    </svg>
                  </a>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">5K+</div>
                    <div className="text-sm text-gray-600">Followers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">98%</div>
                    <div className="text-sm text-gray-600">Response Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Location & Map Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16" data-aos="fade-up">
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-teal-100 text-green-700 rounded-full px-6 py-3 text-sm font-bold mb-8 shadow-lg">
              <MdLocationOn className="mr-3 h-5 w-5" />
              <span>Lokasi Kami</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Kunjungi 
              <span className="text-transparent bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text"> Toko Kami</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Temukan lokasi toko fisik kami dan nikmati pengalaman berbelanja langsung 
              dengan produk-produk berkualitas tinggi dari Lyvia Nusa Boga.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Enhanced Address Info */}
            <div data-aos="fade-right">
              {/* Main Address Card */}
              <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 hover:shadow-3xl transition-all duration-700 group hover:-translate-y-2 overflow-hidden relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-3xl flex items-center justify-center mr-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-2xl">
                      <MdLocationOn className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-500">
                        Alamat Toko Utama
                      </h3>
                      <div className="flex items-center mt-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                        <span className="text-sm text-gray-600 font-medium">Buka Sekarang</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <MdLocationOn className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900 font-semibold mb-1">Alamat Lengkap</p>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          Jln Gandari V, No 9 GPI Manado<br />
                          Kecamatan Wenang<br />
                          Kota Manado, Sulawesi Utara 95111
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <MdSchedule className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900 font-semibold mb-1">Jam Operasional</p>
                        <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                          <p>Senin - Sabtu: 08:00 - 17:00</p>
                          <p>Minggu: <span className="text-red-600 font-medium">Tutup</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <MdDirections className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-900 font-semibold mb-1">Akses Transportasi</p>
                        <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                          <p>• 5 menit dari pusat kota Manado</p>
                          <p>• 15 menit dari Bandara Sam Ratulangi</p>
                          <p>• Area parkir tersedia</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <button className="group/btn flex items-center justify-center bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                      <MdDirections className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
                      <span>Petunjuk Arah</span>
                    </button>
                    
                    <button className="group/btn flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                      <MdPhone className="mr-2 h-5 w-5 group-hover/btn:scale-110 transition-transform duration-300" />
                      <span>Hubungi</span>
                    </button>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-green-400 to-teal-500 rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-700"></div>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div data-aos="fade-left">
              <div className="relative group">
                <div className="rounded-3xl overflow-hidden border-2 border-slate-200 shadow-2xl h-96 lg:h-[500px] flex items-center justify-center">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.3736972743977!2d124.89781437602434!3d1.5418830984437104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3287a15d8bc274c9%3A0x77dd2701b2d5c12!2sLyvia%20Nusa%20Boga!5e0!3m2!1sid!2sid!4v1761705458709!5m2!1sid!2sid"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Lyvia Nusa Boga"
                  ></iframe>
                </div>

                {/* Map Features */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <div className="group/feature bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hover:border-green-200 transition-all duration-500 hover:-translate-y-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                        <MdGpsFixed className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">GPS Aktif</span>
                    </div>
                  </div>
                  
                  <div className="group/feature bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hover:border-blue-200 transition-all duration-500 hover:-translate-y-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                        <MdNavigation className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-gray-900">Navigasi</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distance Info */}
              <div className="mt-8 grid grid-cols-3 gap-4">
                <div className="text-center bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">2.5km</div>
                  <div className="text-xs sm:text-sm text-gray-600">Dari Pusat Kota</div>
                </div>
                <div className="text-center bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">5 min</div>
                  <div className="text-xs sm:text-sm text-gray-600">Berkendara</div>
                </div>
                <div className="text-center bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">15 min</div>
                  <div className="text-xs sm:text-sm text-gray-600">Jalan Kaki</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
