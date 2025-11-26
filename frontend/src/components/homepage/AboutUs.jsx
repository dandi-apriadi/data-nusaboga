import React, { useEffect } from 'react';
import { BsShop, BsPeople, BsClock, BsCheckCircle } from 'react-icons/bs'; // replaced BsAward with BsCheckCircle
import AOS from 'aos';
import 'aos/dist/aos.css';
import img from '../../assets/img/homepage/bg.png';

export const AboutUs = () => {
    const stats = [
        { icon: <BsShop className="w-6 h-6" />, value: '5+', label: 'Years of Experience' },
        { icon: <BsPeople className="w-6 h-6" />, value: '1000+', label: 'Satisfied Customers' },
        { icon: <BsCheckCircle className="w-6 h-6" />, value: '95%', label: 'Safer Than Cigarettes' },
        { icon: <BsClock className="w-6 h-6" />, value: '24/7', label: 'Support' }
    ];

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            easing: 'ease-out-cubic'
        });
    }, []);

    return (
        <div className="relative h-auto mb-20">
            {/* Enhanced Background with Modern Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] 
                from-violet-50/90 via-white to-emerald-50/90 
                dark:from-indigo-950/80 dark:via-gray-900 dark:to-emerald-950/80" />

            {/* Modern Pattern Overlay */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath fill=%22%234338CA%22 fill-opacity=%22.03%22 d=%22M12 0L0 12L12 24L24 12z%22/%3E%3C/svg%3E')] 
                    [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_100%)]
                    dark:bg-[url('data:image/svg+xml,%3Csvg width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath fill=%22%236366F1%22 fill-opacity=%22.05%22 d=%22M12 0L0 12L12 24L24 12z%22/%3E%3C/svg%3E')]" />
            </div>

            {/* Animated Floating Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 -left-20 w-96 h-96 bg-brand-500/20 
                    dark:bg-indigo-600/10 rounded-full 
                    mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-float-slow" />
                <div className="absolute bottom-20 -right-20 w-96 h-96 bg-violet-500/20 
                    dark:bg-violet-700/15 rounded-full 
                    mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl animate-float-delay" />
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Enhanced Content Section with AOS */}
                    <div className="space-y-12">
                        <div className="space-y-6" data-aos="fade-right" data-aos-delay="100">
                            <h2 className="text-5xl lg:text-6xl font-bold">
                                <span className="inline-block bg-gradient-to-r from-brand-600 via-violet-600 to-brand-600 
                                    dark:from-brand-300 dark:via-violet-300 dark:to-brand-300 
                                    bg-clip-text text-transparent">
                                    About AREA 51 VAPESTORE
                                </span>
                            </h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-brand-500 to-violet-500 
                                dark:from-brand-400 dark:to-violet-400 rounded-full"
                                data-aos="fade-right" data-aos-delay="200" />
                            <p className="text-xl text-gray-600 dark:text-gray-200 leading-relaxed"
                                data-aos="fade-up" data-aos-delay="300">
                                Your premier destination for quality vaping products in Manado, Sulawesi Utara.
                                We believe vaping is a harm reduction solution—a safer way to reduce or quit smoking.
                            </p>
                            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
                                data-aos="fade-up" data-aos-delay="400">
                                Located at Kawasan Megamas BNI Goedang Gadget, Manado SA 95111, Indonesia.
                                With over 5 years of experience, we ensure only the best products are available for our customers.
                            </p>
                        </div>

                        {/* Stats Grid with AOS */}
                        <div className="grid grid-cols-2 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index}
                                    data-aos="zoom-in-up"
                                    data-aos-delay={200 + (index * 100)}
                                    className="group relative">
                                    {/* Background Pattern */}
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2220%22 height=%2220%22 viewBox=%220 0 20 20%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23000%22 fill-opacity=%22.03%22 fill-rule=%22evenodd%22%3E%3Ccircle cx=%223%22 cy=%223%22 r=%223%22/%3E%3C/g%3E%3C/svg%3E')] 
                                        opacity-20 rounded-3xl mix-blend-overlay" />

                                    {/* Card Container */}
                                    <div className="relative p-8 rounded-3xl 
                                        bg-gradient-to-br from-white/80 via-gray-50/90 to-gray-100/80 
                                        dark:from-navy-800/90 dark:via-gray-900 dark:to-navy-900
                                        backdrop-blur-sm
                                        shadow-[0_10px_50px_-20px_rgba(0,0,0,0.15)]
                                        dark:shadow-[0_10px_50px_-20px_rgba(99,102,241,0.15)]
                                        border border-white/20 dark:border-indigo-500/10
                                        transform transition-all duration-300 ease-out
                                        hover:shadow-[0_20px_60px_-30px_rgba(0,0,0,0.2)]
                                        dark:hover:shadow-[0_20px_60px_-30px_rgba(99,102,241,0.25)]
                                        group-hover:-translate-y-1">

                                        {/* Content Layout */}
                                        <div className="flex items-start space-x-6">
                                            {/* Icon Section with Gradient Background */}
                                            <div className="flex-shrink-0">
                                                <div className="p-4 rounded-2xl 
                                                    bg-gradient-to-br from-brand-50 to-violet-50 
                                                    dark:from-indigo-900/40 dark:to-violet-900/40
                                                    shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]
                                                    group-hover:from-brand-100 group-hover:to-violet-100 
                                                    dark:group-hover:from-indigo-800/40 dark:group-hover:to-violet-800/40
                                                    transition-all duration-300">
                                                    {React.cloneElement(stat.icon, {
                                                        className: "w-8 h-8 text-brand-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300"
                                                    })}
                                                </div>
                                            </div>

                                            {/* Text Content with Enhanced Typography */}
                                            <div className="flex-1 space-y-3">
                                                <h3 className="text-4xl font-bold tracking-tight
                                                    bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 
                                                    dark:from-white dark:via-gray-100 dark:to-gray-200 
                                                    bg-clip-text text-transparent
                                                    group-hover:from-brand-600 group-hover:to-violet-600
                                                    dark:group-hover:from-indigo-300 dark:group-hover:to-violet-300
                                                    transition-all duration-300">
                                                    {stat.value}
                                                </h3>
                                                <p className="text-base font-medium text-gray-600 dark:text-gray-300
                                                    group-hover:text-brand-600 dark:group-hover:text-indigo-300
                                                    transition-colors duration-300">
                                                    {stat.label}
                                                </p>

                                                {/* Animated Accent Line */}
                                                <div className="h-0.5 w-12 bg-gradient-to-r from-brand-500 to-violet-500
                                                    dark:from-indigo-400 dark:to-violet-400
                                                    rounded-full opacity-50 group-hover:w-16 group-hover:opacity-100 
                                                    transition-all duration-300 ease-out" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Image Section with AOS */}
                    <div className="relative lg:h-[600px]"
                        data-aos="fade-left"
                        data-aos-delay="400"
                        data-aos-duration="1200">
                        <div className="absolute -inset-4 bg-gradient-to-r from-brand-500 to-violet-500 
                            dark:from-indigo-600/70 dark:to-violet-600/70
                            rounded-2xl opacity-20 dark:opacity-30 blur-2xl transition-opacity duration-500" />
                        <div className="relative h-full rounded-2xl overflow-hidden p-2 bg-white/20 
                            dark:bg-navy-800/30 backdrop-blur-sm">
                            <img src={img} alt="About DandStore"
                                className="w-full h-full object-cover rounded-xl transition-opacity duration-500 
                                    group-hover:opacity-90" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;