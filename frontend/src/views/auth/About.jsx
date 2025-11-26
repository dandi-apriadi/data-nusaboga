import React, { useEffect, useState, useMemo } from 'react';
import Footer from '../../components/Footer';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import { adaptBackendProducts } from '../../utils/productAdapter';
import { PRODUCT_PLACEHOLDER, buildImageUrl } from '../../utils/media';
import { Link } from 'react-router-dom';
import {
  MdVerified,
  MdRestaurant,
  MdLocalShipping,
  MdStarRate,
  MdArrowForward,
  MdHistory,
  MdTrendingUp,
  MdPeople,
  MdPlayCircleOutline,
  MdStar,
  MdFormatQuote
} from 'react-icons/md';
import { 
  FiAward, 
  FiHeart, 
  FiTarget, 
  FiCheck, 
  FiUsers, 
  FiTrendingUp,
  FiGlobe,
  FiShield,
  FiClock
} from 'react-icons/fi';

const About = () => {
  const [counters, setCounters] = useState({
    years: 0,
    products: 0,
    customers: 0
  });
  const dispatch = useDispatch();
  const { items: rawProductItems, loading: productsLoading } = useSelector(state => state.products || { items: [], loading: false });
  const [heroImage, setHeroImage] = useState(null);
  const [heroMeta, setHeroMeta] = useState(null); // store picked product meta (name, etc.)
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    // Disable AOS animations - just show elements immediately
    // Counter animation only
    const animateCounters = () => {
      const targets = { years: 4, products: 25, customers: 350 };
      const duration = 2000;
      const startTime = Date.now();

      const updateCounters = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setCounters({
          years: Math.floor(targets.years * progress),
          products: Math.floor(targets.products * progress),
          customers: Math.floor(targets.customers * progress)
        });

        if (progress < 1) {
          requestAnimationFrame(updateCounters);
        }
      };

      updateCounters();
    };

    const timer = setTimeout(animateCounters, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Fetch products if not loaded yet (limit to get adequate samples)
  useEffect(() => {
    if (!rawProductItems || rawProductItems.length === 0) {
      dispatch(fetchProducts({ page: 1, pageSize: 100 }));
    }
  }, [dispatch, rawProductItems]);

  // Pick a random product image when products list updates
  const adaptedProducts = useMemo(() => adaptBackendProducts(rawProductItems || []), [rawProductItems]);

  const pickRandomHero = () => {
    setImgError(false);
    if (adaptedProducts.length === 0) return;
    // prefer products that have real image not placeholder raw
    const withRealImage = adaptedProducts.filter(p => p.image && !p.image.includes('placeholder'));
    const pool = withRealImage.length ? withRealImage : adaptedProducts;
    const rand = pool[Math.floor(Math.random() * pool.length)];
    setHeroImage(rand.image || PRODUCT_PLACEHOLDER);
    setHeroMeta({ id: rand.id, name: rand.name, raw: rand.raw });
  };

  useEffect(() => { if (adaptedProducts.length) pickRandomHero(); }, [adaptedProducts]);

  const milestones = [
    {
      year: "2013",
      title: "Berdiri",
      description: "Didirikan tahun 2013, memulai usaha olahan ikan cakalang dari dapur keluarga."
    },
    {
      year: "2016",
      title: "Ekspansi",
      description: "Ekspansi produksi dan distribusi ke pasar lokal dan regional."
    },
    {
      year: "2018",
      title: "Produk Abon, Sambal & Snack",
      description: "Meluncurkan varian produk abon cakalang, sambal rica, dan snack berbahan dasar ikan."
    },
    {
      year: "2025",
      title: "Sertifikat Halal Terbaru",
      description: "Mendapatkan sertifikat halal terbaru (Agustus 2025) untuk seluruh produk."
    },
    {
      year: "2025",
      title: "Platform Digital",
      description: "Resmi meluncurkan platform digital marketplace (Oktober 2025) untuk memperluas jangkauan."
    }
  ];

  const values = [
    {
      icon: <FiTarget className="h-8 w-8" />,
      title: "Kualitas Premium",
      description: "Menggunakan ikan cakalang segar pilihan dengan standar kualitas terbaik",
      color: "from-[#4ECDC4] to-[#44A08D]",
      features: ["Bahan Segar", "Proses Higienis", "Kontrol Kualitas"]
    },
    {
      icon: <FiHeart className="h-8 w-8" />,
      title: "Resep Tradisional",
      description: "Mempertahankan resep warisan nenek moyang dengan cita rasa autentik",
      color: "from-[#FF6347] to-[#FF4500]",
      features: ["Resep Turun Temurun", "Rasa Autentik", "Teknik Tradisional"]
    },
    {
      icon: <FiAward className="h-8 w-8" />,
      title: "Kepuasan Pelanggan",
      description: "Berkomitmen memberikan produk terbaik dan layanan yang memuaskan",
      color: "from-[#FFD93D] to-[#FFB347]",
      features: ["Service Excellence", "Garansi Kualitas", "Support 24/7"]
    }
  ];

  const achievements = [
    {
      icon: <FiShield className="h-6 w-6" />,
      title: "Sertifikat Halal MUI",
      year: "2023"
    },
    {
      icon: <FiAward className="h-6 w-6" />,
      title: "UMKM Terbaik Sulawesi",
      year: "2023"
    },
    {
      icon: <FiGlobe className="h-6 w-6" />,
      title: "ISO 22000 Certified",
      year: "2024"
    },
    {
      icon: <FiTrendingUp className="h-6 w-6" />,
      title: "Best Growth Award",
      year: "2024"
    }
  ];

  return (
    <div className="font-sans bg-white overflow-x-hidden">
      {/* Story Section */}
      <section className="py-20 bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center bg-gradient-to-r from-[#FFE8D6] to-[#FFF5E1] text-[#A5352D] rounded-full px-4 py-2 text-sm font-semibold mb-6 shadow-sm">
                <FiClock className="mr-2 h-4 w-4" />
                Cerita Kami
              </div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Dimulai dari 
                <span className="text-transparent bg-gradient-to-r from-[#FF6347] to-[#FF4500] bg-clip-text"> Dapur Keluarga</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                  Lyvia Nusa Boga berawal dari resep tradisional yang telah diturunkan secara turun-temurun 
                  dalam keluarga kami. Dengan kecintaan terhadap cita rasa autentik Indonesia, khususnya 
                  olahan ikan cakalang, kami memutuskan untuk berbagi kelezatan ini dengan masyarakat luas.
                </p>
                
                <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
                  Setiap produk yang kami hasilkan dibuat dengan penuh dedikasi, menggunakan bahan-bahan 
                  segar pilihan dan mempertahankan proses tradisional yang telah terbukti menghasilkan 
                  cita rasa yang tak terlupakan.
                </p>
              </div>

              {/* Achievements */}
              <div className="grid grid-cols-2 gap-4 my-8">
                {achievements.map((achievement, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#FF6347] to-[#FF4500] rounded-xl flex items-center justify-center text-white">
                        {achievement.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-xs sm:text-sm">{achievement.title}</div>
                        <div className="text-[10px] sm:text-xs text-gray-500">{achievement.year}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/auth/products"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#FF6347] via-[#FF4500] to-[#FF6347] text-xs sm:text-sm md:text-base font-semibold rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg hover:shadow-[#FF6347]/50 group"
                >
                  <MdRestaurant className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  Lihat Produk Kami
                  <MdArrowForward className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative group">
                <div className="relative">
                  <img
                    src={heroImage || PRODUCT_PLACEHOLDER}
                    alt={heroMeta?.name ? `Produk: ${heroMeta.name}` : "Produk Unggulan Lyvia Nusa Boga"}
                    className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    crossOrigin="anonymous"
                    onError={(e)=> { if(!imgError){ setImgError(true); e.currentTarget.src = PRODUCT_PLACEHOLDER; } }}
                  />
                  {productsLoading && !heroImage && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/40 backdrop-blur-sm text-slate-600 text-sm font-medium">
                      Memuat gambar produk...
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={pickRandomHero}
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow transition"
                    aria-label="Ganti gambar produk acak"
                  >Ganti</button>
                </div>
                {!heroImage && productsLoading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/40 backdrop-blur-sm text-slate-600 text-sm font-medium">
                    Memuat gambar produk...
                  </div>
                )}
                
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-r from-[#FFD93D] to-[#FFB347] text-white p-6 rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <MdRestaurant className="h-8 w-8 mb-2" />
                  <div className="text-lg font-bold">Resep Tradisional</div>
                  <div className="text-sm opacity-90">Turun Temurun</div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <div className="flex items-center space-x-2 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <MdStar key={i} className="h-5 w-5 text-[#FFD700]" />
                    ))}
                  </div>
                  <div className="text-lg font-bold text-gray-900">4.9/5</div>
                  <div className="text-sm text-gray-600">Rating Pelanggan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Enhanced Design */}
      <section className="py-24 bg-gradient-to-b from-[#FAFAFA] via-white to-[#F5F5F5] relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#FF6347] to-[#FF4500] rounded-full"></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] rounded-full"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-[#FFD93D] to-[#FFB347] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-[#FFE8D6] to-[#FFF5E1] text-[#A5352D] rounded-full px-6 py-3 text-sm font-bold mb-8 shadow-lg">
              <FiHeart className="mr-3 h-5 w-5 animate-pulse" />
              <span>Nilai-Nilai Kami</span>
              <div className="ml-3 w-2 h-2 bg-[#FF6347] rounded-full animate-ping"></div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="block">Komitmen Pada</span>
                <span 
                  className="block text-transparent bg-gradient-to-r from-[#FF6347] via-[#FF4500] to-[#D84315] bg-clip-text"
                >
                  Kualitas Premium
                </span>
              </h2>
              
              <div className="w-24 h-1 bg-gradient-to-r from-[#FF6347] to-[#FF4500] mx-auto rounded-full"></div>
              
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Setiap nilai yang kami pegang teguh menjadi <span className="font-semibold text-[#A5352D]">fondasi kokoh</span> dalam 
                menghadirkan produk berkualitas tinggi yang <span className="font-semibold text-[#D08863]">membanggakan Indonesia</span>
              </p>
            </div>
          </div>

          {/* Enhanced Values Grid */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {values.map((value, index) => (
              <div
                key={index}
                className="group relative bg-white p-8 lg:p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-700 text-center border border-slate-100 hover:border-purple-200 hover:-translate-y-4 overflow-hidden"
              >
                {/* Card Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Icon Container with Enhanced Animation */}
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${value.color} text-white rounded-3xl mb-8 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 shadow-2xl relative`}>
                    {value.icon}
                    {/* Icon Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${value.color} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 scale-150`}></div>
                  </div>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-6 group-hover:text-[#A5352D] transition-colors duration-500">
                    {value.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-8 text-xs sm:text-sm md:text-base lg:text-lg">
                    {value.description}
                  </p>

                  {/* Enhanced Features List */}
                  <div className="space-y-4 mb-8">
                    {value.features.map((feature, featureIndex) => (
                      <div 
                        key={featureIndex} 
                        className="flex items-center justify-center space-x-3 text-xs sm:text-sm group-hover:scale-105 transition-transform duration-300"
                        style={{transitionDelay: `${featureIndex * 100}ms`}}
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiCheck className="h-3 w-3 text-white font-bold" />
                        </div>
                        <span className="text-gray-700 font-medium text-xs sm:text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="relative">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${value.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left`}></div>
                    </div>
                  </div>
                </div>

                {/* Floating Number Badge */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-[#FF6347] to-[#FF4500] text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-500">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action Bottom */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-[#FFE8D6] to-[#FFF5E1] rounded-2xl p-6 shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-semibold text-xs sm:text-sm">Kualitas Terjamin</span>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#4ECDC4] rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                <span className="text-gray-700 font-semibold text-xs sm:text-sm">Pelayanan Prima</span>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#FF6347] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                <span className="text-gray-700 font-semibold text-xs sm:text-sm">Inovasi Berkelanjutan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          {/* Simple Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-[#FFE8D6] to-[#FFF5E1] text-[#A5352D] rounded-full px-4 py-2 text-sm font-medium mb-6 shadow-sm">
              <MdHistory className="mr-2 h-4 w-4" />
              Perjalanan Kami
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Milestone <span className="text-[#FF6347]">Bersejarah</span>
            </h2>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Menelusuri perjalanan dan pencapaian penting dalam mengembangkan Lyvia Nusa Boga
            </p>
          </div>

          {/* Simple Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#FF6347] via-[#FF8E53] to-[#FFD93D]"></div>
            
            {milestones.map((milestone, index) => (
              <div
                key={index}
                className="relative flex items-start mb-12 last:mb-0"
              >
                {/* Timeline Dot */}
                <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-r from-[#FF6347] to-[#FF4500] rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10">
                  {milestone.year.slice(-2)}
                </div>
                
                {/* Content */}
                <div className="ml-8 bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">{milestone.title}</h3>
                    <span className="text-xs sm:text-sm font-medium text-[#A5352D] bg-gradient-to-r from-[#FFE8D6] to-[#FFF5E1] px-2 sm:px-3 py-1 rounded-full">
                      {milestone.year}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Simple Summary */}
          <div className="mt-16 text-center bg-gradient-to-br from-[#FFF8F0] to-[#FFE8D6] rounded-2xl p-8">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#FF6347]">{milestones.length}</div>
                <div className="text-xs sm:text-sm text-gray-600">Milestone Penting</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#4ECDC4]">2013</div>
                <div className="text-xs sm:text-sm text-gray-600">Berdiri</div>
              </div>
              <div>
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#FFD93D]">2025</div>
                <div className="text-xs sm:text-sm text-gray-600">Platform Digital</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
