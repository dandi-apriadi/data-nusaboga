import React, { useState } from 'react';
import { BsPerson, BsEnvelope, BsPhone, BsChatText, BsGeoAlt } from 'react-icons/bs';

const ContactForm = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSuccess(true);
        setLoading(false);
        setFormData({
            fullname: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });
        setTimeout(() => setSuccess(false), 3000);
    };

    return (
        <div className="relative min-h-screen py-16 overflow-hidden 
            bg-gradient-to-br from-gray-50 via-white to-gray-100
            dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 
            transition-colors duration-500">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 -left-4 w-72 h-72 
                    bg-gray-200/40 dark:bg-blue-500/10 
                    rounded-full mix-blend-multiply dark:mix-blend-overlay 
                    filter blur-xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 
                    bg-gray-100/40 dark:bg-purple-500/10 
                    rounded-full mix-blend-multiply dark:mix-blend-overlay 
                    filter blur-xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 
                    bg-gray-300/40 dark:bg-indigo-500/10 
                    rounded-full mix-blend-multiply dark:mix-blend-overlay 
                    filter blur-xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="max-w-3xl mx-auto text-center mb-12 space-y-6">
                    <div className="relative">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold">
                            <span className="inline-block bg-gradient-to-r 
                                from-gray-800 via-gray-600 to-gray-800 
                                dark:from-gray-100 dark:via-gray-300 dark:to-gray-100 
                                bg-clip-text text-transparent pb-2 
                                transform hover:scale-105 transition-all duration-300">
                                Hubungi Kami
                            </span>
                            <div className="absolute left-1/2 -bottom-2 w-24 h-1 
                                bg-gradient-to-r from-transparent 
                                via-gray-400 dark:via-gray-500 to-transparent 
                                transform -translate-x-1/2"></div>
                        </h2>
                    </div>

                    <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 
                        font-light leading-relaxed">
                        Kami siap membantu menjawab
                        <span className="inline-block px-4 py-1 mx-2 
                            bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm 
                            border border-gray-200 dark:border-gray-700 
                            text-gray-700 dark:text-gray-200 
                            shadow-sm">
                            pertanyaan
                        </span>
                        Anda
                    </p>
                </div>

                {/* Location Information */}
                <div className="max-w-2xl mx-auto mb-8 p-6
                    bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm
                    border border-gray-100 dark:border-gray-700
                    rounded-xl text-center">
                    <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                        <BsGeoAlt className="w-5 h-5" />
                        <span className="font-medium">Visit Our Store</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                        Kawasan Megamas BNI Goedang Gadget, Manado SA 95111, Indonesia
                    </p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="max-w-2xl mx-auto mb-6 
                        bg-green-50 dark:bg-green-900/20 
                        backdrop-blur-sm border 
                        border-green-200 dark:border-green-800 
                        text-green-600 dark:text-green-400 
                        p-4 rounded-xl text-center animate-fade-in">
                        ✨ Pesan berhasil dikirim!
                    </div>
                )}

                {/* Form Container */}
                <form onSubmit={handleSubmit}
                    className="max-w-2xl mx-auto 
                    bg-white/90 dark:bg-gray-800/90 
                    backdrop-blur-md rounded-2xl p-8 
                    shadow-lg dark:shadow-black/20 
                    border border-gray-100 dark:border-gray-700 
                    hover:border-gray-200 dark:hover:border-gray-600 
                    transition-all duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Input Fields */}
                        <div className="relative group">
                            <label className="block text-sm font-medium 
                                text-gray-600 dark:text-gray-300 mb-2 
                                group-hover:text-gray-800 dark:group-hover:text-gray-100 
                                transition-colors duration-200">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 
                                    text-gray-400 dark:text-gray-500 
                                    group-hover:text-gray-600 dark:group-hover:text-gray-400 
                                    transition-colors">
                                    <BsPerson className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 
                                        bg-white/80 dark:bg-gray-900/80 
                                        border border-gray-200 dark:border-gray-700 
                                        rounded-xl 
                                        focus:outline-none 
                                        focus:border-gray-400 dark:focus:border-gray-500 
                                        text-gray-700 dark:text-gray-200 
                                        placeholder-gray-400 dark:placeholder-gray-500 
                                        transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-600 mb-2 
                                group-hover:text-gray-800 transition-colors duration-200">
                                Email
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 
                                    text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <BsEnvelope className="w-5 h-5" />
                                </span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 
                                        rounded-xl focus:outline-none focus:border-gray-400 
                                        text-gray-700 placeholder-gray-400 transition-all"
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-600 mb-2 
                                group-hover:text-gray-800 transition-colors duration-200">
                                Nomor Telepon
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 
                                    text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <BsPhone className="w-5 h-5" />
                                </span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 
                                        rounded-xl focus:outline-none focus:border-gray-400 
                                        text-gray-700 placeholder-gray-400 transition-all"
                                    placeholder="+62 xxx-xxxx-xxxx"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="block text-sm font-medium text-gray-600 mb-2 
                                group-hover:text-gray-800 transition-colors duration-200">
                                Subjek
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 
                                    text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <BsChatText className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 
                                        rounded-xl focus:outline-none focus:border-gray-400 
                                        text-gray-700 placeholder-gray-400 transition-all"
                                    placeholder="Subjek pesan"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2 
                                group-hover:text-gray-800 transition-colors duration-200">
                                Pesan
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="5"
                                className="w-full p-4 bg-white/80 border border-gray-200 
                                    rounded-xl focus:outline-none focus:border-gray-400 
                                    text-gray-700 placeholder-gray-400 transition-all"
                                placeholder="Tulis pesan Anda di sini..."
                                required
                            ></textarea>
                        </div>

                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium shadow-lg shadow-blue-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Mengirim...
                                    </span>
                                ) : (
                                    'Kirim Pesan'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactForm;