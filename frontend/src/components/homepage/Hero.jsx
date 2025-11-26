import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import heroImage from '../../assets/img/homepage/logo.png';

const Hero = () => {
    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            disable: 'mobile' // Disable on mobile for better performance
        });
    }, []);

    return (
        <div className="relative min-h-[80vh] mt-16 md:mt-1 sm:min-h-[85vh] 
            flex items-center overflow-hidden 
            bg-gradient-to-b from-transparent via-sky-50/50 to-blue-100/30
            dark:from-transparent dark:via-slate-800/40 dark:to-indigo-950/20">
            {/* Background Layers */}
            <div className="absolute inset-0 z-0">
                {/* Base Gradient - Enhanced Blue */}
                <div className="absolute inset-0 bg-gradient-to-b 
                    from-white via-sky-100 to-blue-200 
                    dark:from-gray-900 dark:via-navy-800 dark:to-indigo-900/60 
                    transition-colors duration-300" />

                {/* Wave Patterns */}
                <div className="absolute inset-0">
                    <svg className="absolute bottom-0 left-0 w-full"
                        viewBox="0 0 1440 320" preserveAspectRatio="none">
                        <path fill="rgb(147 197 253 / 0.3)"
                            fillOpacity="1"
                            className="dark:fill-[#334155]/30"
                            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
                        </path>
                        <path fill="rgb(96 165 250 / 0.4)"
                            fillOpacity="1"
                            className="dark:fill-[#1e3a8a]/30"
                            d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,128C672,107,768,117,864,144C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
                        </path>
                    </svg>
                </div>

                {/* Enhanced Bottom Light Effect */}
                <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t 
                    from-blue-300/60 to-transparent 
                    dark:from-indigo-900/60 dark:to-transparent" />

                {/* Enhanced Animated Overlays */}
                <div className="absolute inset-0">
                    <div className="absolute bottom-0 -right-48 w-[30rem] h-[30rem] 
                        bg-gradient-to-br from-blue-400/40 to-transparent 
                        dark:from-blue-500/20 dark:to-purple-600/10
                        rounded-full filter blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-0 -left-48 w-[30rem] h-[30rem] 
                        bg-gradient-to-tr from-sky-400/40 to-transparent 
                        dark:from-indigo-600/20 dark:to-purple-700/10
                        rounded-full filter blur-3xl animate-pulse-slow delay-1000" />
                </div>

                {/* Enhanced Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.07]"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0),
                            linear-gradient(45deg, rgb(59 130 246 / 0.1) 25%, transparent 25%),
                            linear-gradient(-45deg, rgb(59 130 246 / 0.1) 25%, transparent 25%)
                        `,
                        backgroundSize: '20px 20px, 60px 60px, 60px 60px'
                    }}
                />
            </div>

            {/* Bottom Blur Effect */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t 
                from-blue-300/80 via-blue-200/40 to-transparent 
                dark:from-indigo-900/80 dark:via-indigo-800/30
                backdrop-blur-[8px] z-10" />

            {/* Content Container with adjusted z-index */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-20">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                    {/* Text Content */}
                    <div className="flex-1 text-center lg:text-left max-w-2xl lg:max-w-none mx-auto"
                        data-aos="fade-right">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold 
                            text-slate-800 dark:text-white mb-4 sm:mb-6 leading-tight tracking-tight">
                            Discover Premium Vaping at
                            <span className="text-teal-600 dark:text-teal-300 block sm:inline">
                                {" "}AREA 51 VAPESTORE
                            </span>
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl text-slate-700/90 
                            dark:text-slate-200 mb-6 sm:mb-8 max-w-xl lg:max-w-2xl mx-auto lg:mx-0">
                            Your one-stop destination for quality vaping products in Manado.
                            95% safer than traditional cigarettes and the perfect solution to quit smoking.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <Link to="/products"
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white 
                                    rounded-full font-semibold hover:bg-blue-700 dark:bg-blue-600 
                                    dark:hover:bg-blue-500 transform hover:-translate-y-1 transition-all
                                    duration-300 shadow-lg hover:shadow-xl dark:shadow-blue-900/50 
                                    backdrop-blur-sm text-center">
                                Shop Now
                            </Link>
                            <Link to="/categories"
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-transparent border-2 
                                    border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-300 
                                    rounded-full font-semibold hover:bg-blue-600/10 transform
                                    dark:hover:bg-blue-600/20 hover:-translate-y-1 transition-all 
                                    duration-300 backdrop-blur-sm text-center">
                                Browse Categories
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image with enhanced shadow */}
                    <div className="flex-1 mt-8 lg:mt-0 px-4 sm:px-0" data-aos="fade-left" data-aos-delay="200">
                        <div className="relative max-w-lg lg:max-w-2xl mx-auto">
                            <img
                                src={heroImage}
                                alt="DandStore Shopping Experience"
                                className="w-full h-auto object-cover object-center
                                    drop-shadow-2xl dark:drop-shadow-[0_20px_35px_rgba(79,70,229,0.25)]
                                    transform hover:scale-105 transition-transform duration-500
                                    rounded-lg z-10"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;